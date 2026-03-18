<script setup lang="ts">
defineProps<{
  activeView: "config" | "preview";
}>();

defineEmits<{
  (e: "update:activeView", view: "config" | "preview"): void;
}>();
</script>

<template>
  <nav
    class="lg:hidden h-16 bg-ide-sidebar border-t border-ide-border flex items-center justify-around px-6 z-50"
  >
    <button
      @click="$emit('update:activeView', 'config')"
      class="flex flex-col items-center gap-1 transition-all"
      :class="
        activeView === 'config'
          ? 'text-ide-accent scale-110'
          : 'text-ide-text-muted'
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
      class="flex flex-col items-center gap-1 transition-all"
      :class="
        activeView === 'preview'
          ? 'text-ide-accent scale-110'
          : 'text-ide-text-muted'
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
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
      <span class="text-[10px] font-black uppercase tracking-widest"
        >Preview</span
      >
    </button>
  </nav>
</template>
