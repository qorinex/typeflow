<template>
  <div
    class="rounded-xl overflow-hidden min-w-[148px] bg-zinc-900/95 border outline-sky-500 outline-offset-2 relative shadow-lg shadow-black/20"
    :class="[selected ? ' outline-1 outline-double' : '']"
    :style="{ borderColor: nodeLook.borderColor }"
  >
    <div
      class="flex items-center gap-2 px-2.5 py-2 border-b border-white/[0.06]"
      :style="{ background: nodeLook.headerBackground || '#18181b' }"
    >
      <img
        v-if="nodeLook.icon"
        :src="nodeLook.icon"
        class="shrink-0"
        :style="{ width: nodeLook.iconSize || '1rem', height: nodeLook.iconSize || '1rem' }"
        alt=""
      />
      <div class="min-w-0 flex-1">
        <div class="text-sm font-medium text-zinc-100 leading-tight truncate">
          {{ data.displayName }}
        </div>
        <div class="text-[10px] text-zinc-500 font-mono leading-tight mt-0.5 truncate">
          {{ data.id.slice(0, 8) }}
        </div>
      </div>
    </div>

    <div class="flex justify-between text-sm py-3 gap-4 px-0.5">
      <div class="flex flex-col">
        <div
          v-for="(pin, index) in data.inPins"
          :key="`in-${index}`"
          class="flex gap-2 py-1 items-center relative pr-1"
        >
          <component
            :is="PinHandleComp"
            :node-id="data.id"
            :index="index"
            type="source"
            :pin="pin"
            :connectable="connectable"
          />
          <div class="flex flex-col ml-1 leading-3">
            <span class="text-xs text-zinc-300">{{ pin.name }}</span>
            <span
              v-if="resolvedLabel(pin, data.id)"
              class="text-[9px] font-mono"
            >
              <TypeSchemeLabel
                :text="resolvedLabel(pin, data.id) || ''"
                :fallback-color="labelColor(pin, data.id)"
              />
            </span>
          </div>
        </div>
      </div>
      <div class="flex flex-col">
        <div
          v-for="(pin, index) in data.outPins"
          :key="`out-${index}`"
          class="flex gap-2 py-1 items-center relative justify-end pl-1"
        >
          <div class="flex flex-col mr-1 leading-3 items-end">
            <span class="text-xs text-zinc-300">{{ pin.name }}</span>
            <span
              v-if="resolvedLabel(pin, data.id)"
              class="text-[9px] font-mono"
            >
              <TypeSchemeLabel
                :text="resolvedLabel(pin, data.id) || ''"
                :fallback-color="labelColor(pin, data.id)"
              />
            </span>
          </div>
          <component
            :is="PinHandleComp"
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
import { computed, inject } from 'vue'
import {
  type NodeData,
  type Pin,
  findTypeVars,
  isNamedType,
  resolveScheme,
} from '../core'
import DefaultPinHandle from './PinHandle.vue'
import { pinHandleKey } from './pinHandleKey'
import { useWildcards } from '../composables/useWildcards'
import { useFlowTheme } from '../theme'
import { useTypeRegistry } from '../typeRegistry'
import TypeSchemeLabel from './TypeSchemeLabel.vue'

const PinHandleComp = inject(pinHandleKey, DefaultPinHandle)

const props = withDefaults(
  defineProps<{
    data: NodeData
    selected?: boolean
    connectable?: boolean
  }>(),
  {
    selected: false,
    connectable: true,
  },
)

const { nodeWildcards } = useWildcards()
const { pinColor, nodeStyle } = useFlowTheme()
const { typeRegistry } = useTypeRegistry()

const nodeLook = computed(() => nodeStyle(props.data.nodeClass))

function resolvedLabel(pin: Pin, nodeId: string): string | null {
  const hasTypeVars = findTypeVars(pin.valueSchema).length > 0
  const resolved = resolveScheme(pin.valueSchema, nodeId, nodeWildcards.value)
  if (!hasTypeVars && (!isNamedType(resolved) || !Object.keys(resolved.args ?? {}).length)) {
    return null
  }
  const label = typeRegistry.value.format(resolved)
  if (hasTypeVars || label.includes('[') || label.includes('{')) return label
  return null
}

function labelColor(pin: Pin, nodeId: string): string {
  const resolved = resolveScheme(pin.valueSchema, nodeId, nodeWildcards.value)
  return pinColor(typeRegistry.value.colorKey(resolved))
}
</script>
