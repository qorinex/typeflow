<template>
  <g>
    <BaseEdge
      :id="id"
      :path="path[0]"
      :style="edgeStyle"
      :class="['flow-edge-path', isConflict ? 'flow-edge-conflict' : '']"
    />
  </g>
</template>

<script setup lang="ts">
import { BaseEdge, getBezierPath, type Position } from '@vue-flow/core'
import { computed } from 'vue'
import { isTypeVar, pinIdToData, resolveScheme } from '../core'
import { useWildcards } from '../composables/useWildcards'
import { useFlowTheme } from '../theme'
import { useTypeRegistry } from '../typeRegistry'

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
const { pinColor, theme } = useFlowTheme()
const { typeRegistry } = useTypeRegistry()

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

const isConflict = computed(() => conflicts.value.some((c) => c.edgeId === props.id))

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
    if (!isTypeVar(resolved)) {
      const icon = typeRegistry.value.getDef(resolved.type)?.icon
      if (icon === 'list' || icon === 'map' || icon === 'tuple' || icon === 'struct') {
        return resolved.type
      }
    }
    return typeRegistry.value.colorKey(resolved)
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
    strokeWidth: theme.value.canvas.edgeStrokeWidth,
    fill: 'none',
  }
})
</script>
