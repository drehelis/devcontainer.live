<script setup lang="ts">
import IconSliders from "../ui/icons/IconSliders.vue";
import IconEye from "../ui/icons/IconEye.vue";

defineProps<{
  activeView: "config" | "preview";
  version: string;
}>();

defineEmits<{
  (e: "update:activeView", view: "config" | "preview"): void;
}>();
</script>

<template>
  <nav class="mobile-nav-container transition-all duration-300">
    <button
      @click="$emit('update:activeView', 'config')"
      class="flex flex-col items-center gap-1 transition-all min-w-20 active:opacity-70"
      :class="
        activeView === 'config'
          ? 'text-ide-accent scale-110'
          : 'text-ide-text-muted/60'
      "
    >
      <IconSliders size="24" stroke-width="1.5" />
      <span class="text-[10px] font-black uppercase tracking-widest"
        >Config</span
      >
    </button>

    <button
      @click="$emit('update:activeView', 'preview')"
      class="flex flex-col items-center gap-1 transition-all min-w-20 active:opacity-70"
      :class="
        activeView === 'preview'
          ? 'text-ide-accent scale-110'
          : 'text-ide-text-muted/60'
      "
    >
      <IconEye size="24" stroke-width="1.5" />
      <span class="text-[10px] font-black uppercase tracking-widest"
        >Preview</span
      >
    </button>

    <!-- Version Tag in far corner -->
    <span
      class="absolute bottom-1 right-2 text-[7px] font-mono text-ide-text-bright/30 uppercase tracking-tighter pointer-events-none"
      >v{{ version }}</span
    >
  </nav>
</template>
