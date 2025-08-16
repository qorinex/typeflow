<template>
  <div
    v-if="conflicts.length"
    class="absolute top-3 right-3 z-10 w-80 max-h-[50%] overflow-auto rounded-lg border border-red-500/60 bg-zinc-950/95 p-3 text-xs shadow-xl"
  >
    <div class="font-semibold text-red-400 mb-1">
      Conflicts ({{ conflicts.length }})
    </div>
    <div
      v-for="(conflict, index) in conflicts"
      :key="index"
      class="mb-2 last:mb-0 pl-2 border-l-2 border-red-500/80"
    >
      <div class="text-zinc-200 font-mono break-all">{{ conflict.reason }}</div>
      <div
        v-if="conflict.source || conflict.target"
        class="text-[10px] text-zinc-500 mt-0.5"
      >
        {{ conflict.source }} -> {{ conflict.target }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useWildcards } from '../composables/useWildcards'

const { conflicts } = useWildcards()
</script>
