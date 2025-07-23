<template>
  <StructIcon
    v-if="pin.valueSchema.type === 'struct'"
    :class="className"
    :primary-color="frame"
    :secondary-color="pinColor('struct')"
  />
  <MapIcon
    v-else-if="pin.valueSchema.type === 'map'"
    :class="className"
    :primary-color="frame"
    :secondary-color="pinColor(pin.valueSchema.entry?.type || 'any')"
  />
  <TupleIcon
    v-else-if="pin.valueSchema.type === 'tuple'"
    :class="className"
    :primary-color="frame"
    :secondary-color="pinColor('tuple')"
  />
  <ListIcon
    v-else-if="pin.valueSchema.type === 'list' || pin.valueSchema.type === 'option'"
    :class="className"
    :primary-color="frame"
    :secondary-color="pinColor(pin.valueSchema.item?.type || 'any')"
  />
  <ExecIcon
    v-else-if="pin.valueSchema.type === 'exec'"
    :primary-color="pinColor('exec')"
    :class="className"
  />
  <PrimitiveIcon
    v-else
    :class="className"
    :primary-color="pinColor(pin.valueSchema.type)"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Pin } from '../../core'
import { usePlanTheme } from '../../theme'
import StructIcon from './StructIcon.vue'
import MapIcon from './MapIcon.vue'
import TupleIcon from './TupleIcon.vue'
import ListIcon from './ListIcon.vue'
import ExecIcon from './ExecIcon.vue'
import PrimitiveIcon from './PrimitiveIcon.vue'

defineProps<{
  pin: Pin
  className?: string
}>()

const { pinColor, theme } = usePlanTheme()
const frame = computed(() => theme.value.pinFallback.color)
</script>
