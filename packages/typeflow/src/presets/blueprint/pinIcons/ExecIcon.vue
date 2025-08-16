<template>
  <svg fill="none" height="34" viewBox="0 0 34 34" width="34" xmlns="http://www.w3.org/2000/svg">
    <path
      :fill="primaryColor"
      d="M25.8 15.2a2 2 0 0 1 0 3.6l-14.2 7.1c-1.5.75-3.3-.34-3.3-2V10.1c0-1.66 1.8-2.75 3.3-2l14.2 7.1Z"
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
    primaryColor: '#e6e6e6',
    secondaryColor: '#e6e6e6',
  },
)
</script>
