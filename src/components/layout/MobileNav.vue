<script setup lang="ts">
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
      <svg
        class="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>
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
      <svg
        class="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
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
