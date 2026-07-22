<template>
  <div class="w-full h-full flex min-h-0">
    <div ref="canvasRoot" class="flex-1 min-w-0 relative flow-canvas-root" :style="rootStyle">
      <div v-if="challenge" class="absolute top-4 left-4 z-20 w-[350px] rounded-xl border border-zinc-700/80 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur">
        <div class="mb-3 inline-flex rounded-full bg-sky-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-400">{{ challenge.level }}</div>
        <div class="flex items-start gap-3">
          <div class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold" :class="challengeComplete ? 'bg-emerald-500 text-zinc-950' : 'bg-sky-500 text-zinc-950'">
            {{ challengeComplete ? '✓' : '1' }}
          </div>
          <div>
            <div class="font-semibold">{{ challengeComplete ? 'Excellent - solved!' : challenge.title }}</div>
            <p class="mt-1 text-sm leading-5 text-zinc-400">
              {{ challengeComplete ? challenge.completeText : challenge.description }}
            </p>
          </div>
        </div>
        <button v-if="challengeComplete" class="mt-3 w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400" @click="reset">
          Try again
        </button>
      </div>

      <div class="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-xl border border-zinc-700/80 bg-zinc-900/95 p-1.5 shadow-xl backdrop-blur">
        <button class="tool-button tool-button-primary" type="button" @click="paletteOpen = !paletteOpen">+ Add node</button>
        <button class="tool-button" type="button" title="Fit graph to screen" @click="fitView({ padding: 0.2, duration: 250 })">Fit view</button>
        <button class="tool-button tool-button-danger" type="button" :disabled="!hasSelection" title="Delete selected node or connection" @click="deleteSelection">Delete</button>
        <button class="tool-button" type="button" title="Restore the original graph" @click="reset">Reset</button>
      </div>

      <div v-if="paletteOpen" class="absolute top-16 right-4 z-30 max-h-[70vh] w-72 overflow-auto rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-2xl">
        <div class="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Add to canvas</div>
        <button v-for="item in nodePalette" :key="item.kind" class="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-zinc-800" @click="addNode(item)">
          <span class="h-8 w-1 rounded-full" :class="item.color" />
          <span><span class="block text-sm font-medium">{{ item.label }}</span><span class="block text-xs text-zinc-500">{{ item.hint }}</span></span>
        </button>
      </div>

      <div class="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-zinc-700/70 bg-zinc-900/90 px-4 py-2 text-xs text-zinc-400 shadow-lg pointer-events-none">
        Drag a pin to connect <span class="mx-2 text-zinc-700">•</span> Click to select <span class="mx-2 text-zinc-700">•</span> Delete to remove
      </div>

      <svg v-if="connectionAnimation" class="pointer-events-none absolute inset-0 z-40 h-full w-full overflow-visible">
        <path :d="connectionAnimation.path" fill="none" stroke="#e4e4e7" stroke-width="2" stroke-linecap="round" stroke-dasharray="5 5" opacity="0.8" />
        <circle :cx="connectionAnimation.x" :cy="connectionAnimation.y" r="10" fill="#18181b" stroke="#fafafa" stroke-width="2" />
        <path :transform="`translate(${connectionAnimation.x - 5} ${connectionAnimation.y - 6})`" d="M1 1v12l3.5-3 2.5 5 2-1-2.5-5H11z" fill="#fafafa" />
      </svg>

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
        @node-click="selectNode"
        @edge-click="selectEdge"
        @pane-click="clearSelection"
      >
        <Background
          :pattern-color="theme.canvas.patternColor"
          :gap="theme.canvas.patternGap"
          :style="{ background: theme.canvas.background }"
        />

        <div
          v-if="showLegend"
          class="absolute bottom-3 left-3 opacity-80 z-10 pointer-events-none hidden lg:block"
        >
          <PinLegend />
        </div>

        <ConflictPanel />

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
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import {
  ConflictPanel,
  EdgeItem,
  FlowNode,
  PinLegend,
  cloneDeep,
  createTypeRegistry,
  dataToPinId,
  pinsFromPacks,
  provideTypeRegistry,
  schemeTypeTag,
  typeVar,
  useTypeflow,
  type NodeData,
  type PinTypeScheme,
} from '@qorinex/typeflow'
import { bp, blueprintTypePack, provideBlueprintPreset } from '@qorinex/typeflow/presets/blueprint'
import { applyRocketNodeIcons, rocketTypePack } from '@/data/rocketTypePack'

const props = withDefaults(
  defineProps<{
    nodes: NodeData[]
    showLegend?: boolean
    challenge?: {
      level: string
      title: string
      description: string
      completeText: string
      connections: Array<{
        fromType: string
        fromPin: number
        toType: string
        toPin: number
      }>
    }
    autoConnect?: Array<{
      delay: number
      fromNode: string
      fromPin: number
      toNode: string
      toPin: number
    }>
  }>(),
  {
    showLegend: true,
  },
)

const emit = defineEmits<{
  'update:nodes': [nodes: NodeData[]]
}>()

const { theme } = provideBlueprintPreset()
if (props.challenge) {
  const demoPacks = [blueprintTypePack, rocketTypePack]
  Object.assign(theme.pins, pinsFromPacks(demoPacks))
  applyRocketNodeIcons(theme)
  provideTypeRegistry(createTypeRegistry({ packs: demoPacks }))
}
const { fitView } = useVueFlow()
const initialNodes = cloneDeep(props.nodes)
const paletteOpen = ref(false)
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)
const autoConnectTimers: number[] = []
const canvasRoot = ref<HTMLElement | null>(null)
const connectionAnimation = ref<{ x: number; y: number; path: string } | null>(null)
let animationFrame = 0

type PalettePin = { name: string; schema: PinTypeScheme }
type PaletteItem = { kind: string; label: string; hint: string; color: string; nodeClass: string; inputs: PalettePin[]; outputs: PalettePin[] }
const { list, map: mapOf, tuple } = bp

const nodePalette: PaletteItem[] = [
  { kind: 'var', label: 'Generic value', hint: 'Unbound type T', color: 'bg-zinc-400', nodeClass: 'const', inputs: [], outputs: [{ name: 'value', schema: typeVar(0) }] },
  { kind: 'text', label: 'Text', hint: 'string source', color: 'bg-emerald-400', nodeClass: 'const', inputs: [], outputs: [{ name: 'value', schema: { type: 'str' } }] },
  { kind: 'integer', label: 'Integer', hint: 'integer source', color: 'bg-amber-400', nodeClass: 'const', inputs: [], outputs: [{ name: 'value', schema: { type: 'int' } }] },
  { kind: 'string-list', label: 'String list', hint: 'List<string>', color: 'bg-emerald-400', nodeClass: 'const', inputs: [], outputs: [{ name: 'items', schema: list({ type: 'str' }) }] },
  { kind: 'number-list', label: 'Number list', hint: 'List<int>', color: 'bg-amber-400', nodeClass: 'const', inputs: [], outputs: [{ name: 'items', schema: list({ type: 'int' }) }] },
  { kind: 'float-map', label: 'Score map', hint: 'Map<float>', color: 'bg-orange-400', nodeClass: 'const', inputs: [], outputs: [{ name: 'entries', schema: mapOf({ type: 'float' }) }] },
  { kind: 'first', label: 'First', hint: 'List<T> → T', color: 'bg-sky-400', nodeClass: 'func', inputs: [{ name: 'items', schema: list(typeVar(0)) }], outputs: [{ name: 'first', schema: typeVar(0) }] },
  { kind: 'map', label: 'Map', hint: 'List<T> → List<U>', color: 'bg-sky-400', nodeClass: 'func', inputs: [{ name: 'items', schema: list(typeVar(0)) }], outputs: [{ name: 'mapped', schema: list(typeVar(1)) }] },
  { kind: 'filter', label: 'Filter', hint: 'List<T> → List<T>', color: 'bg-sky-400', nodeClass: 'func', inputs: [{ name: 'items', schema: list(typeVar(0)) }], outputs: [{ name: 'kept', schema: list(typeVar(0)) }] },
  { kind: 'foreach', label: 'For each', hint: 'List<T> → T', color: 'bg-sky-400', nodeClass: 'func', inputs: [{ name: 'items', schema: list(typeVar(0)) }], outputs: [{ name: 'item', schema: typeVar(0) }] },
  { kind: 'join', label: 'Join', hint: 'Merge two List<T>', color: 'bg-violet-400', nodeClass: 'func', inputs: [{ name: 'left', schema: list(typeVar(0)) }, { name: 'right', schema: list(typeVar(0)) }], outputs: [{ name: 'items', schema: list(typeVar(0)) }] },
  { kind: 'zip', label: 'Zip', hint: 'List<T> + List<U>', color: 'bg-violet-400', nodeClass: 'func', inputs: [{ name: 'left', schema: list(typeVar(0)) }, { name: 'right', schema: list(typeVar(1)) }], outputs: [{ name: 'pairs', schema: list(tuple(typeVar(0), typeVar(1))) }] },
  { kind: 'pair', label: 'Pair', hint: 'T + U → Tuple<T, U>', color: 'bg-violet-400', nodeClass: 'func', inputs: [{ name: 'first', schema: typeVar(0) }, { name: 'second', schema: typeVar(1) }], outputs: [{ name: 'pair', schema: tuple(typeVar(0), typeVar(1)) }] },
  { kind: 'split', label: 'Split pair', hint: 'Tuple<T, U> → T + U', color: 'bg-violet-400', nodeClass: 'func', inputs: [{ name: 'pair', schema: tuple(typeVar(0), typeVar(1)) }], outputs: [{ name: 'first', schema: typeVar(0) }, { name: 'second', schema: typeVar(1) }] },
  { kind: 'branch', label: 'Branch', hint: 'T + bool → two T outputs', color: 'bg-cyan-400', nodeClass: 'pivot', inputs: [{ name: 'value', schema: typeVar(0) }, { name: 'condition', schema: { type: 'bool' } }], outputs: [{ name: 'true', schema: typeVar(0) }, { name: 'false', schema: typeVar(0) }] },
  { kind: 'select', label: 'Select', hint: 'Choose between two T values', color: 'bg-cyan-400', nodeClass: 'pivot', inputs: [{ name: 'left', schema: typeVar(0) }, { name: 'right', schema: typeVar(0) }, { name: 'condition', schema: { type: 'bool' } }], outputs: [{ name: 'selected', schema: typeVar(0) }] },
  { kind: 'to-string', label: 'To string', hint: 'int → string', color: 'bg-rose-400', nodeClass: 'func', inputs: [{ name: 'number', schema: { type: 'int' } }], outputs: [{ name: 'text', schema: { type: 'str' } }] },
  { kind: 'sum', label: 'Sum', hint: 'List<int> → int', color: 'bg-rose-400', nodeClass: 'func', inputs: [{ name: 'numbers', schema: list({ type: 'int' }) }], outputs: [{ name: 'total', schema: { type: 'int' } }] },
  { kind: 'inspect', label: 'Inspect', hint: 'Consumes any T', color: 'bg-fuchsia-400', nodeClass: 'proc', inputs: [{ name: 'value', schema: typeVar(0) }], outputs: [] },
]

const rootStyle = computed(() => ({
  background: theme.canvas.background,
}))

const {
  elements,
  isValidConnection,
  onConnect,
  onEdgesChange,
  onNodesChange,
} = useTypeflow({
  nodes: () => props.nodes,
  onUpdateNodes: (nodes) => emit('update:nodes', nodes),
})

const hasSelection = computed(() => !!selectedNodeId.value || !!selectedEdgeId.value)
const challengeComplete = computed(() => !!props.challenge && props.challenge.connections.every((expected) => {
  const source = props.nodes.find((node) => node.type === expected.fromType)
  const target = props.nodes.find((node) => node.type === expected.toType)
  if (!source || !target) return false
  return target.inPins[expected.toPin]?.links.some((link) =>
    link.outNode === source.id && link.outIdx === expected.fromPin,
  ) ?? false
}))

function selectNode({ node }: any) {
  selectedNodeId.value = node.id
  selectedEdgeId.value = null
}

function selectEdge({ edge }: any) {
  selectedEdgeId.value = edge.id
  selectedNodeId.value = null
}

function clearSelection() {
  selectedNodeId.value = null
  selectedEdgeId.value = null
  paletteOpen.value = false
}

function deleteSelection() {
  if (selectedEdgeId.value) {
    onEdgesChange([{ id: selectedEdgeId.value, type: 'remove' } as any])
  } else if (selectedNodeId.value) {
    const removedId = selectedNodeId.value
    const next = props.nodes
      .filter((node) => node.id !== removedId)
      .map((node) => ({
        ...node,
        inPins: node.inPins.map((pin) => ({
          ...pin,
          links: pin.links.filter((link) => link.inNode !== removedId && link.outNode !== removedId),
        })),
      }))
    emit('update:nodes', next)
  }
  clearSelection()
}

function addNode(item: PaletteItem) {
  const livePositions = new Map(
    elements.value
      .filter((element) => element?.position && element?.source == null)
      .map((element) => [element.id, element.position]),
  )
  const currentNodes = props.nodes.map((existing) => {
    const position = livePositions.get(existing.id)
    return position ? { ...existing, x: position.x, y: position.y } : existing
  })
  const addedCount = currentNodes.filter((existing) => existing.type.startsWith('demo-')).length
  const node: NodeData = {
    id: crypto.randomUUID(),
    displayName: item.label,
    type: `demo-${item.kind}-${Date.now()}`,
    nodeClass: item.nodeClass,
    x: 380 + (addedCount % 4) * 36,
    y: 280 + (addedCount % 5) * 36,
    inPins: item.inputs.map((pin) => ({ name: pin.name, linkable: true, valueSchema: pin.schema, links: [] })),
    outPins: item.outputs.map((pin) => ({ name: pin.name, linkable: true, valueSchema: pin.schema, links: [] })),
  }
  emit('update:nodes', [...currentNodes, node])
  paletteOpen.value = false
}

function reset() {
  emit('update:nodes', cloneDeep(initialNodes))
  clearSelection()
  scheduleAutoConnect()
  nextTick(() => fitView({ padding: 0.2, duration: 250 }))
}

function clearAutoConnectTimers() {
  autoConnectTimers.splice(0).forEach((timer) => window.clearTimeout(timer))
  window.cancelAnimationFrame(animationFrame)
  connectionAnimation.value = null
}

function scheduleAutoConnect() {
  clearAutoConnectTimers()
  for (const connection of props.autoConnect ?? []) {
    if (isAutoConnected(connection)) continue
    autoConnectTimers.push(window.setTimeout(() => animateAutoConnection(connection), connection.delay))
  }
}

function isAutoConnected(connection: NonNullable<typeof props.autoConnect>[number]) {
  const target = props.nodes.find((node) => node.id === connection.toNode)
  return target?.inPins[connection.toPin]?.links.some((item) =>
    item.outNode === connection.fromNode && item.outIdx === connection.fromPin,
  ) ?? false
}

function handleCenter(nodeId: string, direction: 'in' | 'out', pinIndex: number) {
  const node = props.nodes.find((item) => item.id === nodeId)
  const pin = direction === 'out' ? node?.outPins[pinIndex] : node?.inPins[pinIndex]
  const root = canvasRoot.value
  if (!pin || !root) return null
  const handleId = dataToPinId(direction, pinIndex, nodeId, schemeTypeTag(pin.valueSchema))
  const handle = Array.from(root.querySelectorAll<HTMLElement>('[data-handleid]'))
    .find((item) => item.dataset.handleid === handleId)
  if (!handle) return null
  const rootRect = root.getBoundingClientRect()
  const rect = handle.getBoundingClientRect()
  return { x: rect.left + rect.width / 2 - rootRect.left, y: rect.top + rect.height / 2 - rootRect.top }
}

function animateAutoConnection(connection: NonNullable<typeof props.autoConnect>[number]) {
  if (isAutoConnected(connection)) return
  const start = handleCenter(connection.fromNode, 'out', connection.fromPin)
  const end = handleCenter(connection.toNode, 'in', connection.toPin)
  if (!start || !end) return commitAutoConnection(connection)
  const startedAt = performance.now()
  const duration = 700
  const frame = (now: number) => {
    const raw = Math.min(1, (now - startedAt) / duration)
    const progress = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2
    const x = start.x + (end.x - start.x) * progress
    const y = start.y + (end.y - start.y) * progress
    connectionAnimation.value = { x, y, path: `M ${start.x} ${start.y} C ${start.x + 90} ${start.y}, ${x - 90} ${y}, ${x} ${y}` }
    if (raw < 1) animationFrame = window.requestAnimationFrame(frame)
    else {
      connectionAnimation.value = null
      commitAutoConnection(connection)
    }
  }
  animationFrame = window.requestAnimationFrame(frame)
}

function commitAutoConnection(connection: NonNullable<typeof props.autoConnect>[number]) {
  const nodes = cloneDeep(props.nodes)
  const target = nodes.find((node) => node.id === connection.toNode)
  const targetPin = target?.inPins[connection.toPin]
  if (!targetPin || targetPin.links.some((item) => item.outNode === connection.fromNode && item.outIdx === connection.fromPin)) return
  targetPin.links.push(linkForAutoConnect(connection))
  emit('update:nodes', nodes)
}

function linkForAutoConnect(connection: NonNullable<typeof props.autoConnect>[number]) {
  return {
    inNode: connection.toNode,
    inIdx: connection.toPin,
    outNode: connection.fromNode,
    outIdx: connection.fromPin,
  }
}

function onKeydown(event: KeyboardEvent) {
  if ((event.key === 'Delete' || event.key === 'Backspace') && hasSelection.value) {
    event.preventDefault()
    deleteSelection()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  scheduleAutoConnect()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  clearAutoConnectTimers()
})
</script>

<style scoped>
.tool-button { @apply rounded-lg px-3 py-2 text-sm text-zinc-300 transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-800; }
.tool-button-primary { @apply bg-sky-500 font-semibold text-zinc-950 hover:bg-sky-400; }
.tool-button-danger { @apply text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:bg-transparent; }
</style>
