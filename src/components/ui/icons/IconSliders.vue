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
      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
    />
  </IconBase>
</template>
