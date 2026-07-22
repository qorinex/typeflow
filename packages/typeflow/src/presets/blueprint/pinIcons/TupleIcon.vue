<template>
  <svg fill="none" height="34" viewBox="0 0 34 34" width="34" xmlns="http://www.w3.org/2000/svg">
    <path
      :stroke="primaryColor"
      stroke-width="2.25"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M13 6.5c-3.3 2.8-5 6.3-5 10.5s1.7 7.7 5 10.5M21 6.5c3.3 2.8 5 6.3 5 10.5s-1.7 7.7-5 10.5"
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
