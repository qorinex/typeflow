<template>
  <div
    class="relative"
    :class="type === 'target' ? 'right-1' : 'left-1'"
    :title="tooltip"
  >
    <PinIcon :pin="resolvedPin" class-name="absolute w-5 h-5 pointer-events-none" />
    <Handle
      :id="dataToPinId(directionMap[type], index, nodeId, schemeTypeTag(pin.valueSchema))"
      :position="type === 'target' ? Position.Right : Position.Left"
      :type="type"
      :connectable="connectable"
      :is-valid-connection="validateHandle"
      class="relative h-5 w-5 top-0 !translate-x-0 !translate-y-0 rounded-none bg-transparent border-none"
    />
  </div>
</template>

<script lang="ts" setup>
import { Handle, Position, type Connection, type HandleType, type ValidConnectionFunc } from '@vue-flow/core'
import { computed } from 'vue'
import {
  type Pin,
  dataToPinId,
  canConnect,
  resolveScheme,
  schemeTypeTag,
} from '../../core'
import { useWildcards } from '../../composables/useWildcards'
import { useTypeRegistry } from '../../typeRegistry'
import PinIcon from './pinIcons/PinIcon.vue'

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
const { typeRegistry } = useTypeRegistry()

const resolvedPin = computed((): Pin => ({
  ...props.pin,
  valueSchema: resolveScheme(props.pin.valueSchema, props.nodeId, nodeWildcards.value),
}))

const tooltip = computed(() => typeRegistry.value.format(resolvedPin.value.valueSchema))

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
