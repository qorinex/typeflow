<template>
  <svg fill="none" height="34" viewBox="0 0 34 34" width="34" xmlns="http://www.w3.org/2000/svg">
    <path
      :stroke="primaryColor"
      stroke-width="2.25"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M13 7c-2.5 0-4 1.5-4 4v2.5c0 1.8-.9 3-2.5 3.5C8.1 17.5 9 18.7 9 20.5V23c0 2.5 1.5 4 4 4M21 7c2.5 0 4 1.5 4 4v2.5c0 1.8.9 3 2.5 3.5-1.6.5-2.5 1.7-2.5 3.5V23c0 2.5-1.5 4-4 4"
    />
    <rect x="14" y="14" width="6" height="6" rx="1" :fill="secondaryColor" />
  </svg>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    primaryColor?: string
    secondaryColor?: string
  }>(),
  {
    primaryColor: '#a1a1aa',
    secondaryColor: '#e6e6e6',
  },
)
</script>
