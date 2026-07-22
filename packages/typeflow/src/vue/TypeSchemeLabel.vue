<template>
  <span>
    <span
      v-for="(token, index) in tokens"
      :key="index"
      :style="{ color: token.color }"
    >{{ token.text }}</span>
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useFlowTheme } from '../theme'
import { useTypeRegistry } from '../typeRegistry'

const props = defineProps<{
  text: string
  fallbackColor: string
}>()

const { pinColor, theme } = useFlowTheme()
const { typeRegistry } = useTypeRegistry()

const tokens = computed(() =>
  props.text
    .split(/([A-Za-z_][A-Za-z0-9_-]*)/g)
    .filter(Boolean)
    .map((text) => {
      const isIdentifier = /^[A-Za-z_]/.test(text)
      return {
        text,
        color: typeRegistry.value.getDef(text)
          ? pinColor(text)
          : isIdentifier
            ? props.fallbackColor
            : theme.value.pinFallback.color,
      }
    }),
)
</script>
