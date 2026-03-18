<script setup lang="ts">
type Section = "general" | "features" | "ports" | "history" | "advanced";

defineProps<{
  activeSection: Section;
}>();

defineEmits<{
  (e: "update:activeSection", section: Section): void;
}>();

const sections = [
  { id: "general", name: "General" },
  { id: "features", name: "Features" },
  { id: "ports", name: "Network" },
  { id: "history", name: "Storage" },
  { id: "advanced", name: "Hooks" },
];
</script>

<template>
  <div
    class="lg:hidden flex overflow-x-auto bg-ide-activity border-b border-ide-border no-scrollbar sticky top-0 z-30"
  >
    <button
      v-for="s in sections"
      :key="s.id"
      @click="$emit('update:activeSection', s.id as Section)"
      class="flex-shrink-0 px-5 py-3.5 flex items-center justify-center transition-all relative"
      :class="
        activeSection === s.id
          ? 'text-ide-text-bright'
          : 'text-ide-text-muted hover:text-ide-text'
      "
    >
      <span
        class="text-[10px] font-black uppercase tracking-[0.15em] border-b-2 pb-0.5"
        :class="
          activeSection === s.id ? 'border-ide-accent' : 'border-transparent'
        "
      >
        {{ s.name }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
