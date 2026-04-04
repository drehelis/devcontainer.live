<script setup lang="ts">
import IconBase from "./IconBase.vue";

defineProps<{
  size?: number | string;
  strokeWidth?: number | string;
}>();
</script>

<template>
  <IconBase :size="size" :stroke-width="strokeWidth">
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </IconBase>
</template>
