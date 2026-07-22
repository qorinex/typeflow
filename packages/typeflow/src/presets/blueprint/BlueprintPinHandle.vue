<template>
  <div
    class="pin-handle relative"
    :class="[type === 'target' ? 'right-1' : 'left-1', { 'pin-handle-pressed': pressed }]"
    :title="tooltip"
    @pointerdown.capture="pressed = true"
  >
    <PinIcon :pin="resolvedPin" class-name="pin-handle-visual absolute w-5 h-5 pointer-events-none" />
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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

const { nodeWildcards, validationWildcards, nodesById } = useWildcards()
const { typeRegistry } = useTypeRegistry()
const pressed = ref(false)

const releasePin = () => { pressed.value = false }
onMounted(() => window.addEventListener('pointerup', releasePin))
onBeforeUnmount(() => window.removeEventListener('pointerup', releasePin))

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
    validationWildcards.value,
  )
}
</script>

<style scoped>
.pin-handle-visual {
  transition: filter 140ms ease, transform 140ms ease;
  transform-origin: center;
}

.pin-handle:hover .pin-handle-visual {
  transform: scale(1.02);
}

.pin-handle.pin-handle-pressed .pin-handle-visual {
  transform: scale(1.12);
}
</style>
