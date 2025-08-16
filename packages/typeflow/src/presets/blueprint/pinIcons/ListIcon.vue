<template>
  <svg fill="none" height="34" viewBox="0 0 34 34" width="34" xmlns="http://www.w3.org/2000/svg">
    <path
      :stroke="primaryColor"
      stroke-width="2.25"
      stroke-linecap="round"
      d="M11 6.5H8.5a2 2 0 0 0-2 2v17a2 2 0 0 0 2 2H11M23 6.5h2.5a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2H23"
    />
    <path
      :stroke="secondaryColor"
      stroke-width="2.5"
      stroke-linecap="round"
      d="M12.5 12h9M12.5 17h9M12.5 22h6"
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
