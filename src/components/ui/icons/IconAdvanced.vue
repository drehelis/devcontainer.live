<script setup lang="ts">
import IconBase from "./IconBase.vue";

defineProps<{
  size?: number | string;
  strokeWidth?: number | string;
}>();
</script>

<template>
  <IconBase :size="size" :stroke-width="strokeWidth">
    <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </IconBase>
</template>
