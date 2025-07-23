<template>
  <g>
    <BaseEdge
      :id="id"
      :path="path[0]"
      :style="edgeStyle"
      :class="['plan-edge-path', isConflict ? 'plan-edge-conflict' : '']"
    />
  </g>
</template>

<script setup lang="ts">
import { BaseEdge, getBezierPath, type Position } from '@vue-flow/core'
import { computed } from 'vue'
import { pinIdToData, resolveScheme } from '../core'
import { useWildcards } from '../composables/useWildcards'
import { usePlanTheme } from '../theme'

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

const { nodeWildcards, nodesById, conflicts } = useWildcards()
const { pinColor, theme } = usePlanTheme()

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

const isConflict = computed(() => {
  const list = conflicts.value
  if (!list.length) return false
  const sourceNodeId = pinIdToData(props.sourceHandleId || '').nodeId
  const targetNodeId = pinIdToData(props.targetHandleId || '').nodeId
  return list.some((conflict) => {
    if (
      conflict.edgeId &&
      (conflict.edgeId.includes(props.id) || props.id.includes(conflict.edgeId))
    ) {
      return true
    }
    return (
      (conflict.source === sourceNodeId && conflict.target === targetNodeId) ||
      (conflict.source === targetNodeId && conflict.target === sourceNodeId)
    )
  })
})

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
    if (pin.valueSchema.type === 'wildcard' && resolved.type !== 'wildcard') {
      return resolved.type
    }
    return type || 'any'
  } catch {
    return 'any'
  }
})

const edgeStyle = computed(() => {
  if (isConflict.value) {
    return {
      stroke: '#ef4444',
      strokeWidth: (theme.value.canvas.edgeStrokeWidth || 1.5) + 1,
      fill: 'none',
      strokeDasharray: '6 4',
    }
  }
  return {
    stroke: pinColor(visualType.value),
    strokeWidth:
      visualType.value === 'exec'
        ? theme.value.canvas.edgeStrokeWidth + 0.5
        : theme.value.canvas.edgeStrokeWidth,
    fill: 'none',
  }
})
</script>
