<template>
  <svg fill="none" height="34" viewBox="0 0 34 34" width="34" xmlns="http://www.w3.org/2000/svg">
    <path
      :stroke="primaryColor"
      stroke-width="2.25"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m12 7-4.5 10L12 27M22 7l4.5 10L22 27"
    />
    <path
      :stroke="secondaryColor"
      stroke-width="2.5"
      stroke-linecap="round"
      d="M14 12.5h6M14 17h6M14 21.5h4"
    />
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
