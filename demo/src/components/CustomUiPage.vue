<template>
  <div class="w-full h-full flex flex-col min-h-0">
    
    <div class="flex-1 min-h-0 relative" :style="{ background: theme.canvas.background }">
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

        <template #node-flow="nodeProps">
          <CustomNode
            :data="nodeProps.data"
            :selected="nodeProps.selected"
            :connectable="true"
          />
        </template>

        <template #edge-typed="edgeProps">
          <CustomEdge
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
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import {
  provideFlowTheme,
  useTypeflow,
  type NodeData,
} from 'typeflow'
import { createBlueprintTheme } from 'typeflow/presets/blueprint'
import CustomNode from '@/components/CustomNode.vue'
import CustomEdge from '@/components/CustomEdge.vue'

const props = defineProps<{
  nodes: NodeData[]
}>()

const emit = defineEmits<{
  'update:nodes': [nodes: NodeData[]]
}>()

const theme = createBlueprintTheme()
provideFlowTheme(theme)

const { elements, isValidConnection, onConnect, onEdgesChange, onNodesChange } = useTypeflow({
  nodes: () => props.nodes,
  onUpdateNodes: (nodes) => emit('update:nodes', nodes),
})
</script>
