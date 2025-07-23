<template>
  <div
    class="absolute top-3 right-3 z-10 w-72 max-h-[70%] overflow-auto rounded-lg border border-zinc-700 bg-zinc-900/95 p-3 text-xs shadow-xl"
  >
    <div class="font-semibold text-zinc-200 mb-2">Bindings</div>

    <div v-if="!rows.length" class="text-zinc-500">-</div>

    <div v-for="row in rows" :key="row.nodeId" class="mb-2 last:mb-0">
      <div class="text-sky-400 font-medium truncate">{{ row.label }}</div>
      <div class="text-[10px] text-zinc-600 truncate mb-0.5">{{ row.nodeId }}</div>
      <div
        v-for="binding in row.bindings"
        :key="binding.groupIndex"
        class="flex items-start gap-1.5 pl-1 border-l-2 ml-0.5"
        :style="{ borderColor: binding.color }"
      >
        <span class="text-zinc-500 shrink-0">g{{ binding.groupIndex }}</span>
        <span class="text-zinc-200 font-mono break-all">{{ binding.typeStr }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { getTypeString } from '../core'
import { useWildcards } from '../composables/useWildcards'
import { usePlanTheme } from '../theme'

const { nodeWildcards, nodesById } = useWildcards()
const { pinColor } = usePlanTheme()

const rows = computed(() => {
  return Object.entries(nodeWildcards.value)
    .map(([nodeId, groups]) => {
      const node = nodesById.value[nodeId]
      const bindings = Object.entries(groups).map(([g, scheme]) => ({
        groupIndex: Number(g),
        typeStr: getTypeString(scheme),
        color: pinColor(scheme.type === 'wildcard' ? 'wildcard' : scheme.type),
      }))
      return {
        nodeId,
        label: node?.displayName || nodeId,
        bindings,
      }
    })
    .filter((r) => r.bindings.length)
    .sort((left, right) => left.label.localeCompare(right.label))
})
</script>
