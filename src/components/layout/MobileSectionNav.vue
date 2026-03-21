import { CONFIG_SECTIONS } from "../../constants/ui";
import type { Section } from "../../types";

defineProps<{
  activeSection: Section;
}>();

defineEmits<{
  (e: "update:activeSection", section: Section): void;
}>();
</script>

<template>
  <div class="lg:hidden sticky top-0 z-30 relative bg-ide-activity">
    <div
      class="flex overflow-x-auto border-b border-ide-border no-scrollbar scroll-smooth"
    >
      <button
        v-for="s in CONFIG_SECTIONS"
        :key="s.id"
        @click="$emit('update:activeSection', s.id)"
        class="flex-shrink-0 px-6 py-4 flex items-center justify-center transition-all relative"
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

      <!-- Spacing div at the end to ensure the fade looks good -->
      <div class="flex-shrink-0 w-8"></div>
    </div>

    <!-- Right Fade Indicator -->
    <div
      class="absolute top-0 right-0 w-12 h-[calc(100%-1px)] pointer-events-none bg-gradient-to-l from-ide-activity to-transparent flex items-center justify-end pr-1"
    >
      <div class="text-ide-accent/40">
        <svg
          class="w-2.5 h-2.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="4"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
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
