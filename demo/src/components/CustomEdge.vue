<template>
  <g>
    <BaseEdge
      :id="id"
      :path="path[0]"
      :style="edgeStyle"
      class="flow-edge-path"
    />
  </g>
</template>

<script lang="ts" setup>
import { BaseEdge, getBezierPath, type Position } from '@vue-flow/core'
import { computed } from 'vue'
import {
  isTypeVar,
  pinIdToData,
  resolveScheme,
  schemeTypeTag,
  useFlowTheme,
  useWildcards,
} from '@qorinex/typeflow'

const props = defineProps<{
  id: string
  targetHandleId?: string | null
  sourceHandleId?: string | null
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
}>()

const { nodeWildcards, nodesById } = useWildcards()
const { pinColor } = useFlowTheme()

const path = computed(() =>
  getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
  }),
)

const visualType = computed(() => {
  try {
    const handleId = props.targetHandleId || props.sourceHandleId || ''
    const { direction, index, nodeId, type } = pinIdToData(handleId)
    const node = nodesById.value[nodeId]
    if (!node) return type || 'any'
    const pins = direction === 'in' ? node.inPins : node.outPins
    const pin = pins[index]
    if (!pin) return type || 'any'
    const resolved = resolveScheme(pin.valueSchema, nodeId, nodeWildcards.value)
    if (isTypeVar(pin.valueSchema) && !isTypeVar(resolved)) {
      return schemeTypeTag(resolved)
    }
    return type || 'any'
  } catch {
    return 'any'
  }
})

const edgeStyle = computed(() => ({
  stroke: pinColor(visualType.value),
  strokeWidth: 2.5,
  strokeDasharray: '7 5',
  fill: 'none',
}))
</script>
