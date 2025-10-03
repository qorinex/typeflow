<template>
  <ExecIcon
    v-if="kind === 'exec'"
    :primary-color="primary"
    :class="className"
  />
  <StructIcon
    v-else-if="kind === 'struct'"
    :class="className"
    :primary-color="frame"
    :secondary-color="primary"
  />
  <MapIcon
    v-else-if="kind === 'map'"
    :class="className"
    :primary-color="frame"
    :secondary-color="secondary"
  />
  <TupleIcon
    v-else-if="kind === 'tuple'"
    :class="className"
    :primary-color="frame"
    :secondary-color="primary"
  />
  <ListIcon
    v-else-if="kind === 'list'"
    :class="className"
    :primary-color="frame"
    :secondary-color="secondary"
  />
  <PrimitiveIcon
    v-else
    :class="className"
    :primary-color="primary"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { isTypeVar, schemeTypeTag, type Pin } from '../../../core'
import { useFlowTheme } from '../../../theme'
import { useTypeRegistry } from '../../../typeRegistry'
import type { BlueprintPinIconKind } from '../pack'
import StructIcon from './StructIcon.vue'
import MapIcon from './MapIcon.vue'
import TupleIcon from './TupleIcon.vue'
import ListIcon from './ListIcon.vue'
import ExecIcon from './ExecIcon.vue'
import PrimitiveIcon from './PrimitiveIcon.vue'

const props = defineProps<{
  pin: Pin
  className?: string
}>()

const { pinColor, theme } = useFlowTheme()
const { typeRegistry } = useTypeRegistry()

const frame = computed(() => theme.value.pinFallback.color)

const kind = computed((): BlueprintPinIconKind => {
  if (isTypeVar(props.pin.valueSchema)) return 'primitive'
  const icon = typeRegistry.value.getDef(props.pin.valueSchema.type)?.icon
  if (
    icon === 'list' ||
    icon === 'map' ||
    icon === 'struct' ||
    icon === 'tuple' ||
    icon === 'exec'
  ) {
    return icon
  }
  return 'primitive'
})

const primary = computed(() =>
  pinColor(typeRegistry.value.colorKey(props.pin.valueSchema)),
)

const secondary = computed(() => {
  const s = props.pin.valueSchema
  if (isTypeVar(s)) return pinColor('var')
  const def = typeRegistry.value.getDef(s.type)
  const from = def?.colorFrom
  if (from && s.args?.[from]) {
    const child = s.args[from]
    return pinColor(isTypeVar(child) ? s.type : schemeTypeTag(child))
  }
  return primary.value
})
</script>
