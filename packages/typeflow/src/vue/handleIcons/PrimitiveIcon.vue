<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="none" viewBox="0 0 34 34">
    <rect
      x="7"
      y="7"
      width="20"
      height="20"
      rx="5"
      :fill="primaryColor"
      :fill-opacity="0.92"
    />
    <rect
      x="7"
      y="7"
      width="20"
      height="20"
      rx="5"
      :stroke="primaryColor"
      stroke-width="1.25"
      fill="none"
      opacity="0.55"
    />
  </svg>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    primaryColor?: string
  }>(),
  {
    primaryColor: '#e6e6e6',
  },
)
</script>
