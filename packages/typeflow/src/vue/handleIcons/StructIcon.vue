<template>
  <svg fill="none" height="34" viewBox="0 0 34 34" width="34" xmlns="http://www.w3.org/2000/svg">
    <path
      :stroke="primaryColor"
      stroke-width="2.25"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m22.5 6.5 7 10.5-7 10.5M11.5 6.5l-7 10.5 7 10.5"
    />
    <rect x="12.5" y="12.5" width="4" height="4" rx="0.7" :fill="secondaryColor" />
    <rect x="17.5" y="12.5" width="4" height="4" rx="0.7" :fill="secondaryColor" />
    <rect x="12.5" y="17.5" width="4" height="4" rx="0.7" :fill="secondaryColor" />
    <rect x="17.5" y="17.5" width="4" height="4" rx="0.7" :fill="secondaryColor" />
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
