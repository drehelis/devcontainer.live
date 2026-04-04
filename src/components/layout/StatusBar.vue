<script setup lang="ts">
import { useTheme } from "../../composables/useTheme";
import { URLS } from "../../constants/urls";
import IconChevronDown from "../ui/icons/IconChevronDown.vue";
import IconCheck from "../ui/icons/IconCheck.vue";
import IconGithub from "../ui/icons/IconGithub.vue";
import IconCoffee from "../ui/icons/IconCoffee.vue";

defineProps<{
  version: string;
  cursorPos: { line: number; col: number };
  indentation: number;
  indentEditable?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:indentation", val: number): void;
  (e: "toggleIndentMenu"): void;
}>();

const { themes, currentThemeId, currentTheme, showThemeMenu, setTheme } =
  useTheme();

const currentIndentName = (val: number) => {
  if (val === -1) return "Tabs";
  return "Spaces";
};
</script>

<template>
  <footer
    class="h-6 bg-ide-activity border-t border-ide-border flex items-center justify-between px-3 text-[10px] font-bold text-ide-text z-20 transition-colors duration-300"
  >
    <div class="flex items-center gap-4">
      <!-- Theme Selector -->
      <div class="flex items-center gap-2 theme-selector relative">
        <span>Theme:</span>
        <button
          @click="showThemeMenu = !showThemeMenu"
          class="flex items-center gap-1.5 hover:text-ide-accent transition-colors font-black uppercase tracking-tight"
        >
          {{ currentTheme.name }}
          <IconChevronDown
            size="10"
            stroke-width="4"
            class="opacity-50 transition-transform"
            :class="{ 'rotate-180': showThemeMenu }"
          />
        </button>

        <!-- Themed Dropdown Menu -->
        <div
          v-if="showThemeMenu"
          class="absolute bottom-full left-0 mb-2 w-48 bg-ide-sidebar border border-ide-border rounded-lg shadow-2xl z-[100] overflow-hidden"
        >
          <div
            v-for="t in themes"
            :key="t.id"
            @click="setTheme(t.id)"
            class="px-4 py-2 hover:bg-ide-accent/10 hover:text-ide-accent cursor-pointer transition-colors flex items-center justify-between"
            :class="{
              'bg-ide-accent/5 text-ide-accent font-black':
                currentThemeId === t.id,
            }"
          >
            <span>{{ t.name }}</span>
            <IconCheck
              v-if="currentThemeId === t.id"
              size="12"
              stroke-width="3"
              class="text-ide-accent"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <span class="uppercase tracking-tighter opacity-50">v{{ version }}</span>
      <span>Ln {{ cursorPos.line }}, Col {{ cursorPos.col }}</span>

      <!-- Indentation Selector -->
      <div class="flex items-center gap-2 indent-selector relative">
        <button
          @click="
            if (indentEditable) {
              showThemeMenu = false;
              $emit('toggleIndentMenu');
            }
          "
          class="flex items-center gap-1.5 transition-colors"
          :class="
            indentEditable
              ? 'hover:text-ide-accent cursor-pointer'
              : 'opacity-40 cursor-default'
          "
        >
          {{ currentIndentName(indentation) }}
          <IconChevronDown
            v-if="indentEditable"
            size="10"
            stroke-width="4"
            class="opacity-50 transition-transform"
          />
        </button>
        <!-- Note: Indent menu state management should probably be moved to a composable or shared in App.vue -->
        <slot name="indent-menu" />
      </div>

      <span>UTF-8</span>
      <a
        :href="URLS.REPO_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-ide-text-bright transition-colors flex items-center gap-1 group"
        title="GitHub Repository"
      >
        <IconGithub size="14" class="opacity-70 group-hover:opacity-100" />
      </a>

      <a
        :href="URLS.BUY_ME_A_COFFEE"
        target="_blank"
        rel="noopener noreferrer"
        class="transition-colors flex items-center gap-1 group text-ide-bmc hover:opacity-80"
        title="Buy me a coffee"
      >
        <IconCoffee size="14" />
      </a>
    </div>
  </footer>
</template>
