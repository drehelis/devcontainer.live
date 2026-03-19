<script setup lang="ts">
import { useTheme } from "../../composables/useTheme";

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
          <svg
            class="w-2.5 h-2.5 opacity-50 transition-transform"
            :class="{ 'rotate-180': showThemeMenu }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="4"
              d="M19 9l-7 7-7-7"
            />
          </svg>
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
            <svg
              v-if="currentThemeId === t.id"
              class="w-3 h-3 text-ide-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
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
          <svg
            v-if="indentEditable"
            class="w-2.5 h-2.5 opacity-50 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="4"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <!-- Note: Indent menu state management should probably be moved to a composable or shared in App.vue -->
        <slot name="indent-menu" />
      </div>

      <span>UTF-8</span>
      <a
        href="https://github.com/drehelis/devcontainer.live"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-ide-accent transition-colors flex items-center gap-1 group"
        title="GitHub Profile"
      >
        <svg
          class="w-3.5 h-3.5 opacity-70 group-hover:opacity-100"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-11.999-12-11.999z"
          />
        </svg>
      </a>
    </div>
  </footer>
</template>
