<template>
  <div class="w-full h-full flex min-h-0">
    <div class="flex-1 min-w-0 relative flow-canvas-root" :style="rootStyle">
      <VueFlow
        v-model="elements"
        :fit-view-on-init="true"
        :max-zoom="2.5"
        :min-zoom="0.1"
        :snap-to-grid="true"
        :nodes-connectable="true"
        :edges-updatable="true"
        :is-valid-connection="isValidConnection"
        class="outline-0"
        @connect="onConnect"
        @edges-change="onEdgesChange"
        @nodes-change="onNodesChange"
        @node-click="onNodeClick"
      >
        <Background
          :pattern-color="theme.canvas.patternColor"
          :gap="theme.canvas.patternGap"
          :style="{ background: theme.canvas.background }"
        />

        <div
          v-if="showLegend"
          class="absolute bottom-3 left-3 opacity-80 z-10 pointer-events-none"
        >
          <PinLegend />
        </div>

        <ConflictPanel />
        <WildcardPanel v-if="showWildcardPanel" />

        <template #node-flow="nodeProps">
          <FlowNode
            :data="nodeProps.data"
            :selected="nodeProps.selected"
            :connectable="true"
          />
        </template>

        <template #edge-typed="edgeProps">
          <EdgeItem
            :id="edgeProps.id"
            :target-handle-id="edgeProps.targetHandleId"
            :source-handle-id="edgeProps.sourceHandleId"
            :source-x="edgeProps.sourceX"
            :source-y="edgeProps.sourceY"
            :target-x="edgeProps.targetX"
            :target-y="edgeProps.targetY"
            :source-position="edgeProps.sourcePosition"
            :target-position="edgeProps.targetPosition"
          />
        </template>
      </VueFlow>
    </div>

    <aside
      class="w-72 shrink-0 border-l border-zinc-800 bg-zinc-900/90 flex flex-col min-h-0"
    >
      <div class="px-3 py-2 border-b border-zinc-800">
        <div class="text-xs font-semibold text-zinc-200 tracking-wide">events</div>
        <p class="text-[11px] text-zinc-500 mt-1 leading-snug">link / unlink / node click</p>
      </div>

      <div class="px-3 py-2 border-b border-zinc-800 grid grid-cols-2 gap-2 text-[11px]">
        <div class="rounded bg-zinc-800/80 px-2 py-1.5">
          <div class="text-zinc-500">conflicts</div>
          <div class="font-mono text-zinc-200">{{ conflicts.length }}</div>
        </div>
        <div class="rounded bg-zinc-800/80 px-2 py-1.5">
          <div class="text-zinc-500">bound nodes</div>
          <div class="font-mono text-zinc-200">{{ boundNodeCount }}</div>
        </div>
      </div>

      <div class="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
        <span class="text-[11px] text-zinc-400">log</span>
        <button
          type="button"
          class="text-[10px] text-zinc-500 hover:text-zinc-300"
          @click="log = []"
        >
          clear
        </button>
      </div>

      <ul class="flex-1 overflow-auto p-2 space-y-1.5 font-mono text-[10px]">
        <li v-if="!log.length" class="text-zinc-600 px-1 py-2">
          Connect / disconnect pins or click a node…
        </li>
        <li
          v-for="entry in log"
          :key="entry.id"
          class="rounded px-2 py-1.5 border border-zinc-800/80 bg-zinc-950/50"
        >
          <div class="flex gap-2 items-baseline">
            <span
              class="shrink-0 font-semibold"
              :class="toneClass(entry.kind)"
            >{{ entry.kind }}</span>
            <span class="text-zinc-500">{{ entry.time }}</span>
          </div>
          <div class="text-zinc-400 mt-0.5 break-all">{{ entry.detail }}</div>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import {
  ConflictPanel,
  EdgeItem,
  FlowNode,
  PinLegend,
  WildcardPanel,
  provideFlowTheme,
  useTypeflow,
  type NodeData,
} from 'typeflow'
import {
  createBlueprintTheme,
  provideBlueprintPinHandle,
} from 'typeflow/presets/blueprint'

const props = withDefaults(
  defineProps<{
    nodes: NodeData[]
    showLegend?: boolean
    showWildcardPanel?: boolean
  }>(),
  {
    showLegend: true,
    showWildcardPanel: false,
  },
)

const emit = defineEmits<{
  'update:nodes': [nodes: NodeData[]]
}>()

const theme = createBlueprintTheme()
provideFlowTheme(theme)
provideBlueprintPinHandle()

const rootStyle = computed(() => ({
  background: theme.canvas.background,
}))

type LogKind = 'link+' | 'link-' | 'node-click'
type LogEntry = { id: number; kind: LogKind; time: string; detail: string }

const log = ref<LogEntry[]>([])
let logSeq = 0

function pushLog(kind: LogKind, detail: string) {
  const time = new Date().toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  log.value = [{ id: ++logSeq, kind, time, detail }, ...log.value].slice(0, 40)
}

function toneClass(kind: LogKind) {
  if (kind === 'link+') return 'text-emerald-400'
  if (kind === 'link-') return 'text-rose-400'
  return 'text-sky-400'
}

const {
  elements,
  conflicts,
  wildcards,
  isValidConnection,
  onConnect,
  onEdgesChange,
  onNodesChange,
} = useTypeflow({
  nodes: () => props.nodes,
  onUpdateNodes: (nodes) => emit('update:nodes', nodes),
  onLinkAdded: ({ link, edgeId }) => {
    pushLog(
      'link+',
      `${short(link.outNode)}.out[${link.outIdx}] → ${short(link.inNode)}.in[${link.inIdx}]  (${edgeId})`,
    )
  },
  onLinkRemoved: ({ link, edgeId }) => {
    pushLog(
      'link-',
      `${short(link.outNode)}.out[${link.outIdx}] ✕ ${short(link.inNode)}.in[${link.inIdx}]  (${edgeId})`,
    )
  },
})

const boundNodeCount = computed(() => Object.keys(wildcards.value).length)

function short(id: string) {
  return id.slice(0, 8)
}

function onNodeClick(payload: { node: { id: string; data?: NodeData } }) {
  const name = payload.node.data?.displayName ?? payload.node.id
  pushLog('node-click', `${name} (${short(payload.node.id)})`)
}
</script>
