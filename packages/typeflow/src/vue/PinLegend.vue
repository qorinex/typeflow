<template>
  <div class="flex flex-col gap-1 select-none pointer-events-none">
    <div class="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Connection types</div>
    <div
      v-for="item in items"
      :key="item.type"
      class="flex items-center gap-1.5 capitalize text-xs text-zinc-300"
    >
      <span
        class="inline-block w-3 h-3 rounded-sm shrink-0"
        :style="{ backgroundColor: item.color }"
      />
      <span>{{ item.label }}</span>
      <span class="w-6 h-0.5 rounded ml-1" :style="{ backgroundColor: item.color }" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { usePlanTheme } from '../theme'

const HIDDEN = new Set(['embedded-macro', 'wildcard', 'any'])

const { theme } = usePlanTheme()

const items = computed(() =>
  Object.entries(theme.value.pins)
    .filter(([type]) => !HIDDEN.has(type))
    .map(([type, appearance]) => ({
      type,
      label: appearance.label || type,
      color: appearance.color,
    })),
)
</script>
