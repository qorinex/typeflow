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
    :secondary-color="frame"
  />
  <MapIcon
    v-else-if="kind === 'map'"
    :class="className"
    :primary-color="frame"
    :key-color="mapKeyColor"
    :value-color="mapValueColor"
  />
  <TupleIcon
    v-else-if="kind === 'tuple'"
    :class="className"
    :primary-color="frame"
    :secondary-color="frame"
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
import { findTypeVars, isTypeVar, type Pin, type PinTypeScheme } from '../../../core'
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

const hasUnresolvedVars = computed(() => findTypeVars(props.pin.valueSchema).length > 0)
const frame = computed(() => {
  const isMap = !isTypeVar(props.pin.valueSchema) && props.pin.valueSchema.type === 'map'
  if ((hasUnresolvedVars.value && !isMap) || isTypeVar(props.pin.valueSchema)) {
    return theme.value.pinFallback.color
  }
  return pinColor(props.pin.valueSchema.type)
})

const immediateColor = (scheme: PinTypeScheme) =>
  pinColor(isTypeVar(scheme) ? 'var' : scheme.type)

const mapKeyColor = computed(() => {
  const scheme = props.pin.valueSchema
  if (isTypeVar(scheme) || scheme.type !== 'map') return frame.value
  const key = scheme.args?.key ?? { type: 'str' }
  return immediateColor(key)
})

const mapValueColor = computed(() => {
  const scheme = props.pin.valueSchema
  if (isTypeVar(scheme) || scheme.type !== 'map') return frame.value
  const value = scheme.args?.value ?? scheme.args?.entry
  return value ? immediateColor(value) : frame.value
})

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
  pinColor(hasUnresolvedVars.value ? 'var' : typeRegistry.value.colorKey(props.pin.valueSchema)),
)

const secondary = computed(() => {
  if (hasUnresolvedVars.value) return pinColor('var')
  const s = props.pin.valueSchema
  if (isTypeVar(s)) return pinColor('var')
  const def = typeRegistry.value.getDef(s.type)
  const from = def?.colorFrom
  if (from && s.args?.[from]) {
    const child = s.args[from]
    return pinColor(isTypeVar(child) ? 'var' : child.type)
  }
  return primary.value
})
</script>
