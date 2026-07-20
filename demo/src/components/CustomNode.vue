<template>
  <div
    class="min-w-[148px] rounded-md border-2 bg-zinc-950 px-0 py-0 shadow-lg"
    :class="selected ? 'ring-2 ring-fuchsia-400/80' : ''"
    style="border-color: #e879f9"
  >
    <div
      class="px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-fuchsia-200"
      style="background: linear-gradient(90deg, #86198f55, transparent)"
    >
      {{ data.displayName }}
    </div>
    <div class="flex justify-between gap-3 py-2">
      <div class="flex flex-col">
        <div
          v-for="(pin, index) in data.inPins"
          :key="`in-${index}`"
          class="flex items-center gap-1.5 py-1 pr-1"
        >
          <CustomPin
            :node-id="data.id"
            :index="index"
            type="source"
            :pin="pin"
            :connectable="connectable"
          />
          <span class="text-[11px] text-zinc-400">{{ pin.name }}</span>
        </div>
      </div>
      <div class="flex flex-col items-end">
        <div
          v-for="(pin, index) in data.outPins"
          :key="`out-${index}`"
          class="flex items-center gap-1.5 py-1 pl-1"
        >
          <span class="text-[11px] text-zinc-400">{{ pin.name }}</span>
          <CustomPin
            :node-id="data.id"
            :index="index"
            type="target"
            :pin="pin"
            :connectable="connectable"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { NodeData } from '@qorinex/typeflow'
import CustomPin from '@/components/CustomPin.vue'

withDefaults(
  defineProps<{
    data: NodeData
    selected?: boolean
    connectable?: boolean
  }>(),
  { selected: false, connectable: true },
)
</script>
