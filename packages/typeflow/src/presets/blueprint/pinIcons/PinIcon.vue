<template>
  <PrimitiveIcon
    v-if="isTypeVar(pin.valueSchema)"
    :class="className"
    :primary-color="pinColor('var')"
  />
  <StructIcon
    v-else-if="isNamedType(pin.valueSchema) && pin.valueSchema.type === 'struct'"
    :class="className"
    :primary-color="frame"
    :secondary-color="pinColor('struct')"
  />
  <MapIcon
    v-else-if="isNamedType(pin.valueSchema) && pin.valueSchema.type === 'map'"
    :class="className"
    :primary-color="frame"
    :secondary-color="pinColor(entryTag)"
  />
  <TupleIcon
    v-else-if="isNamedType(pin.valueSchema) && pin.valueSchema.type === 'tuple'"
    :class="className"
    :primary-color="frame"
    :secondary-color="pinColor('tuple')"
  />
  <ListIcon
    v-else-if="
      isNamedType(pin.valueSchema) &&
      (pin.valueSchema.type === 'list' || pin.valueSchema.type === 'option')
    "
    :class="className"
    :primary-color="frame"
    :secondary-color="pinColor(itemTag)"
  />
  <ExecIcon
    v-else-if="isNamedType(pin.valueSchema) && pin.valueSchema.type === 'exec'"
    :primary-color="pinColor('exec')"
    :class="className"
  />
  <PrimitiveIcon
    v-else
    :class="className"
    :primary-color="pinColor(schemeTypeTag(pin.valueSchema))"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import {
  isNamedType,
  isTypeVar,
  schemeTypeTag,
  type Pin,
} from '../../../core'
import { useFlowTheme } from '../../../theme'
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
const frame = computed(() => theme.value.pinFallback.color)

const entryTag = computed(() => {
  const s = props.pin.valueSchema
  if (!isNamedType(s) || !s.entry) return 'any'
  return schemeTypeTag(s.entry)
})

const itemTag = computed(() => {
  const s = props.pin.valueSchema
  if (!isNamedType(s) || !s.item) return 'any'
  return schemeTypeTag(s.item)
})
</script>
