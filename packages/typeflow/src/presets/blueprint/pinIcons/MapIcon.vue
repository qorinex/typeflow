<template>
  <svg fill="none" height="34" viewBox="0 0 34 34" width="34" xmlns="http://www.w3.org/2000/svg">
    <path
      :stroke="primaryColor"
      stroke-width="2.25"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m11 7-5 10 5 10M23 7l5 10-5 10"
    />
    <path
      :stroke="keyColor"
      stroke-width="3.25"
      stroke-linecap="round"
      d="M14 14h6"
    />
    <path
      :stroke="valueColor"
      stroke-width="3.25"
      stroke-linecap="round"
      d="M14 20h6"
    />
  </svg>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    primaryColor?: string
    keyColor?: string
    valueColor?: string
  }>(),
  {
    primaryColor: '#a1a1aa',
    keyColor: '#e6e6e6',
    valueColor: '#e6e6e6',
  },
)
</script>
