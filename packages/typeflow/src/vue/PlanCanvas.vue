<template>
  <div class="w-full h-full relative plan-canvas-root" :style="rootStyle">
    <VueFlow
      v-model="elements"
      :fit-view-on-init="true"
      :max-zoom="2.5"
      :min-zoom="0.1"
      :snap-to-grid="true"
      :nodes-connectable="true"
      :edges-updatable="true"
      class="outline-0"
      @connect="onConnect"
      @edges-change="onGraphChange"
      @nodes-change="onGraphChange"
    >
      <Background
        :pattern-color="theme.canvas.patternColor"
        :gap="theme.canvas.patternGap"
        :style="{ background: theme.canvas.background }"
      />

      <div v-if="theme.chrome.showLegend" class="absolute bottom-3 left-3 opacity-80 z-10">
        <PinLegend />
      </div>

      <ConflictPanel />
      <WildcardPanel v-if="theme.chrome.showWildcardPanel" />

      <template #node-plan="nodeProps">
        <PlanNode
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
</template>

<script lang="ts" setup>
import { computed, provide, ref, watch } from 'vue'
import { VueFlow, type Connection } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import PlanNode from './PlanNode.vue'
import EdgeItem from './EdgeItem.vue'
import PinLegend from './PinLegend.vue'
import WildcardPanel from './WildcardPanel.vue'
import ConflictPanel from './ConflictPanel.vue'
import {
  buildFlowElements,
  canConnect,
  inferWildcards,
  type InferenceConflict,
  type NodeWC,
  type PlanNodeData,
} from '../core'
import { wildcardsKey } from '../composables/useWildcards'
import { createTheme, providePlanTheme, type PlanTheme, type PlanThemeOverride } from '../theme'

const props = withDefaults(
  defineProps<{
    planNodes: PlanNodeData[]
    theme?: PlanTheme
    themeOverride?: PlanThemeOverride
  }>(),
  {
    theme: undefined,
    themeOverride: undefined,
  },
)

const resolvedTheme = computed(() => {
  if (props.theme) return props.theme
  return createTheme(props.themeOverride || {})
})

providePlanTheme(resolvedTheme)
const theme = resolvedTheme

const rootStyle = computed(() => ({
  background: theme.value.canvas.background,
}))

const elements = ref<any[]>([])
const nodeWildcards = ref<NodeWC>({})
const conflicts = ref<InferenceConflict[]>([])

const nodesById = computed(() =>
  Object.fromEntries(props.planNodes.map((n) => [n.id, n])),
)

provide(wildcardsKey, {
  nodeWildcards,
  nodesById,
  conflicts,
})

function recomputeWildcards() {
  const edges = elements.value.filter((e) => e.source && e.target && e.sourceHandle)
  const result = inferWildcards(edges, props.planNodes)
  nodeWildcards.value = result.bindings
  conflicts.value = result.conflicts
}

watch(
  () => props.planNodes,
  (nodes) => {
    elements.value = buildFlowElements(nodes)
    recomputeWildcards()
  },
  { immediate: true, deep: true },
)

function onGraphChange() {
  queueMicrotask(recomputeWildcards)
}

function onConnect(params: Connection) {
  if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) return
  if (
    !canConnect(
      {
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      },
      nodesById.value,
      nodeWildcards.value,
    )
  ) {
    return
  }

  elements.value = [
    ...elements.value,
    {
      id: `EDGE_${params.sourceHandle}_${params.targetHandle}`,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      type: 'typed',
    },
  ]
  recomputeWildcards()
}
</script>
