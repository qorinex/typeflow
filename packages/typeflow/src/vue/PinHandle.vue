<template>
  <div
    class="relative"
    :class="type === 'target' ? 'right-1' : 'left-1'"
    :title="tooltip"
  >
    <PinIcon :pin="resolvedPin" class-name="absolute w-5 h-5 pointer-events-none" />
    <Handle
      :id="dataToPinId(directionMap[type], index, nodeId, pin.valueSchema.type)"
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
  findAllWildcardsInScheme,
  getTypeString,
  getTypeStringWithWildcard,
  replaceAllWildcards,
  cloneDeep,
  canConnect,
} from '../core'
import PinIcon from './handleIcons/PinIcon.vue'
import { useWildcards } from '../composables/useWildcards'

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

const resolvedPin = computed((): Pin => {
  const propValueSchema = cloneDeep(props.pin.valueSchema)
  const wildcards = findAllWildcardsInScheme(propValueSchema)
  if (!wildcards.length) return props.pin

  const bindings = nodeWildcards.value[props.nodeId]
  if (!bindings) return props.pin

  const list = wildcards
    .map((wc) => {
      const bound = bindings[wc.groupIndex]
      if (bound == null) return null
      return [wc.groupIndex, cloneDeep(bound)] as const
    })
    .filter((e): e is readonly [number, typeof propValueSchema] => e != null)
  if (!list.length) return props.pin

  return {
    ...props.pin,
    valueSchema: replaceAllWildcards(propValueSchema, Object.fromEntries(list)),
  }
})

const tooltip = computed(() => {
  const resolved = resolvedPin.value.valueSchema
  return getTypeStringWithWildcard(props.pin.valueSchema, resolved) || getTypeString(resolved)
})

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
