<template>
  <svg fill="none" height="34" viewBox="0 0 34 34" width="34" xmlns="http://www.w3.org/2000/svg">
    <path
      :stroke="primaryColor"
      stroke-width="2.25"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M13 7.5c-1.8 0-3 1.2-3 3v2c0 1-.6 1.6-1.5 2 1 .4 1.5 1 1.5 2v2c0 1.8 1.2 3 3 3"
    />
    <path
      :stroke="primaryColor"
      stroke-width="2.25"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M21 7.5c1.8 0 3 1.2 3 3v2c0 1 .6 1.6 1.5 2-1 .4-1.5 1-1.5 2v2c0 1.8-1.2 3-3 3"
    />
    <circle cx="17" cy="11.25" r="2.15" :fill="secondaryColor" />
    <circle cx="17" cy="16.75" r="2.15" :fill="secondaryColor" />
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
