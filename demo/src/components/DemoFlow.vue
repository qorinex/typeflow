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
import { computed } from 'vue'
import { VueFlow } from '@vue-flow/core'
// import { Background } from '@vue-flow/background'
import {
  ConflictPanel,
  EdgeItem,
  FlowNode,
  PinLegend,
  useTypeflow,
  type NodeData,
} from '@qorinex/typeflow'
import { provideBlueprintPreset } from '@qorinex/typeflow/presets/blueprint'

const props = withDefaults(
  defineProps<{
    nodes: NodeData[]
    showLegend?: boolean
  }>(),
  {
    showLegend: true,
  },
)

const emit = defineEmits<{
  'update:nodes': [nodes: NodeData[]]
}>()

const { theme } = provideBlueprintPreset()

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
</script>
