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
          v-for="graph in graphs"
          :key="graph.id"
          type="button"
          class="px-3 py-1 rounded text-sm transition-colors"
          :class="
            page === 'graph' && activeGraphId === graph.id
              ? 'bg-sky-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          "
          @click="openGraph(graph.id)"
        >
          {{ graph.name }}
        </button>
        <button
          type="button"
          class="px-3 py-1 rounded text-sm transition-colors"
          :class="
            page === 'custom'
              ? 'bg-fuchsia-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          "
          @click="page = 'custom'"
        >
          Custom UI
        </button>
        <button
          type="button"
          class="px-3 py-1 rounded text-sm transition-colors"
          :class="
            page === 'clean'
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          "
          @click="page = 'clean'"
        >
          Clean default
        </button>
      </nav>
      <div class="ml-auto flex items-center gap-3 min-w-0">
        <span
          v-if="page === 'graph' && activeGraph?.description"
          class="text-xs text-zinc-500 truncate hidden sm:inline max-w-xs"
        >
          {{ activeGraph.description }}
        </span>
      </div>
    </header>

    <main class="flex-1 min-h-0">
      <DemoFlow
        v-if="page === 'graph' && activeGraph"
        :key="`graph-${activeGraph.id}`"
        v-model:nodes="activeNodes"
        :show-legend="true"
      />
      <CustomUiPage
        v-else-if="page === 'custom'"
        :key="'custom'"
        v-model:nodes="customNodes"
      />
      <CleanDemoPage
        v-else-if="page === 'clean'"
        :key="'clean'"
        v-model:nodes="cleanNodes"
      />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { cloneDeep, type NodeData } from 'typeflow'
import { sampleGraphs, type SampleGraph } from '@/data/sampleGraphs'
import { cleanGraphNodes } from '@/data/cleanGraph'
import DemoFlow from '@/components/DemoFlow.vue'
import CustomUiPage from '@/components/CustomUiPage.vue'
import CleanDemoPage from '@/components/CleanDemoPage.vue'

type Page = 'graph' | 'custom' | 'clean'

const graphs = ref<SampleGraph[]>(cloneDeep(sampleGraphs))
const activeGraphId = ref(graphs.value[0].id)
const activeGraph = computed(() => graphs.value.find((g) => g.id === activeGraphId.value))

const activeNodes = computed<NodeData[]>({
  get: () => activeGraph.value?.nodes ?? [],
  set: (nodes) => {
    const graph = graphs.value.find((g) => g.id === activeGraphId.value)
    if (graph) graph.nodes = nodes
  },
})

const customNodes = ref<NodeData[]>(cloneDeep(sampleGraphs[0].nodes))
const cleanNodes = ref<NodeData[]>(cloneDeep(cleanGraphNodes))

const page = ref<Page>('graph')

function openGraph(id: string) {
  activeGraphId.value = id
  page.value = 'graph'
}
</script>
