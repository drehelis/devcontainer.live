<script setup lang="ts">
import IconBase from "./IconBase.vue";

defineProps<{
  size?: number | string;
  strokeWidth?: number | string;
}>();
</script>

<template>
  <IconBase :size="size" :stroke-width="strokeWidth">
    <path d="M5 13l4 4L19 7" />
  </IconBase>
</template>
