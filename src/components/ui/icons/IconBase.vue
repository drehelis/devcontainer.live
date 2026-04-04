<script setup lang="ts">
interface Props {
  size?: number | string;
  viewBox?: string;
  strokeWidth?: number | string;
}

withDefaults(defineProps<Props>(), {
  size: 24,
  viewBox: "0 0 24 24",
  strokeWidth: 2,
});
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    :viewBox="viewBox"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="icon-base"
    v-bind="$attrs"
  >
    <slot />
  </svg>
</template>

<style scoped>
.icon-base {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
