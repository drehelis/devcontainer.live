<script setup lang="ts">
import IconBase from "./IconBase.vue";

defineProps<{
  size?: number | string;
  strokeWidth?: number | string;
}>();
</script>

<template>
  <IconBase :size="size" :stroke-width="strokeWidth">
    <path
      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3"
    />
  </IconBase>
</template>
