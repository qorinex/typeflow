<template>
  <div
    class="relative flex items-center justify-center"
    :class="type === 'target' ? 'right-0.5' : 'left-0.5'"
    :title="tooltip"
  >
    <span
      class="pointer-events-none absolute h-3 w-3 rotate-45 border-2 bg-zinc-950"
      :style="{ borderColor: color }"
    />
    <Handle
      :id="handleId"
      :position="type === 'target' ? Position.Right : Position.Left"
      :type="type"
      :connectable="connectable"
      :is-valid-connection="validateHandle"
      class="relative h-4 w-4 !translate-x-0 !translate-y-0 rounded-none border-0 bg-transparent"
    />
  </div>
</template>

<script lang="ts" setup>
import { Handle, Position, type Connection, type HandleType, type ValidConnectionFunc } from '@vue-flow/core'
import { computed } from 'vue'
import {
  canConnect,
  dataToPinId,
  getTypeString,
  resolveScheme,
  schemeTypeTag,
  useFlowTheme,
  useWildcards,
  type Pin,
} from 'typeflow'

const directionMap = {
  source: 'in',
  target: 'out',
} as const

const props = withDefaults(
  defineProps<{
    type: HandleType
    pin: Pin
    index: number
    nodeId: string
    connectable?: boolean
  }>(),
  { connectable: true },
)

const { nodeWildcards, nodesById } = useWildcards()
const { pinColor } = useFlowTheme()

const resolved = computed(() =>
  resolveScheme(props.pin.valueSchema, props.nodeId, nodeWildcards.value),
)

const handleId = computed(() =>
  dataToPinId(directionMap[props.type], props.index, props.nodeId, schemeTypeTag(props.pin.valueSchema)),
)

const color = computed(() => pinColor(schemeTypeTag(resolved.value)))
const tooltip = computed(() => getTypeString(resolved.value) || props.pin.name || '')

const validateHandle: ValidConnectionFunc = (params: Connection) => {
  if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) {
    return false
  }
  return canConnect(
    {
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
    },
    nodesById.value,
    nodeWildcards.value,
  )
}
</script>
