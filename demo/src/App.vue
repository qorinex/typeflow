<template>
  <div class="w-full h-full flex flex-col bg-zinc-950 text-zinc-100">
    <header
      class="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-zinc-800 bg-zinc-900/80"
    >
      <div class="font-semibold tracking-tight text-zinc-100">
        typeflow
        <span class="text-zinc-500 font-normal text-sm ml-1">demo</span>
      </div>
      <div class="h-4 w-px bg-zinc-700" />
      <nav class="flex gap-1 flex-wrap">
        <button
          v-for="plan in samplePlans"
          :key="plan.id"
          type="button"
          class="px-3 py-1 rounded text-sm transition-colors"
          :class="
            activePlanId === plan.id
              ? 'bg-sky-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          "
          @click="activePlanId = plan.id"
        >
          {{ plan.name }}
        </button>
      </nav>
      <div class="ml-auto flex items-center gap-3 min-w-0">
        <span
          v-if="activePlan?.description"
          class="text-xs text-zinc-500 truncate hidden sm:inline max-w-xs"
        >
          {{ activePlan.description }}
        </span>
        <label class="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none shrink-0">
          <input v-model="showDebug" type="checkbox" class="rounded" />
          bindings
        </label>
      </div>
    </header>

    <main class="flex-1 min-h-0">
      <PlanCanvas
        v-if="activePlan"
        :key="activePlan.id"
        :plan-nodes="activePlan.nodes"
        :theme-override="themeOverride"
      />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { PlanCanvas, type PlanThemeOverride } from 'typeflow'
import { samplePlans } from '@/data/samplePlans'

const activePlanId = ref(samplePlans[0].id)
const activePlan = computed(() => samplePlans.find((p) => p.id === activePlanId.value))
const showDebug = ref(false)

const themeOverride = computed<PlanThemeOverride>(() => ({
  chrome: {
    showLegend: true,
    showWildcardPanel: showDebug.value,
  },
}))
</script>
