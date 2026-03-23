<script setup lang="ts">
import { ref, computed, watch, useTemplateRef, nextTick } from "vue";
import { useCommandPalette } from "../../composables/useCommandPalette";

const {
  isOpen,
  query,
  activeIndex,
  filteredCommands,
  close,
  moveUp,
  moveDown,
  runActive,
  runCommand,
} = useCommandPalette();

const inputRef = useTemplateRef<HTMLInputElement>("input");
const activeItemRef = useTemplateRef<HTMLElement>("activeItem");

watch(isOpen, async (open) => {
  if (open) {
    await nextTick();
    inputRef.value?.focus();
  }
});

watch(query, () => {
  activeIndex.value = 0;
});

watch(activeIndex, async () => {
  await nextTick();
  const el = Array.isArray(activeItemRef.value)
    ? activeItemRef.value[0]
    : activeItemRef.value;
  (el as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
});

function onKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowUp") {
    e.preventDefault();
    moveUp();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    moveDown();
  } else if (e.key === "Enter") {
    e.preventDefault();
    runActive();
  } else if (e.key === "Escape") {
    close();
  }
}

const isMouseMoving = ref(false);
let mouseTimeout: number | undefined;

function handleMouseMove() {
  if (isMouseMoving.value) return;
  isMouseMoving.value = true;
  clearTimeout(mouseTimeout);
  mouseTimeout = window.setTimeout(() => {
    isMouseMoving.value = false;
  }, 100);
}

function onMouseEnter(idx: number) {
  if (!isMouseMoving.value) return;
  activeIndex.value = idx;
}

// Group commands by category, including their global index
const groupedCommands = computed(() => {
  const groups: Record<
    string,
    { cmd: (typeof filteredCommands.value)[0]; globalIndex: number }[]
  > = {};
  filteredCommands.value.forEach((cmd, idx) => {
    const cat = cmd.category || "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push({ cmd, globalIndex: idx });
  });
  return groups;
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 scale-[0.98]"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-[0.98]"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
        @mousedown.self="close"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="close"
        />

        <div
          class="palette-panel relative w-full max-w-[560px] mx-4 overflow-hidden rounded-xl shadow-2xl"
          @keydown="onKeydown"
          @mousemove="handleMouseMove"
        >
          <!-- Search Input Row -->
          <div
            class="flex items-center gap-3 px-4 border-b border-ide-border bg-ide-sidebar"
          >
            <!-- Search Icon -->
            <svg
              class="w-4 h-4 text-ide-text-muted shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              ref="input"
              v-model="query"
              type="text"
              placeholder="Type a command..."
              class="flex-1 bg-transparent border-none outline-none py-4 text-[13px] font-mono text-ide-text-bright placeholder:text-ide-text-muted/50"
              autocomplete="off"
              spellcheck="false"
            />

            <kbd
              class="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-mono border border-ide-border text-ide-text-muted bg-ide-activity"
              >ESC</kbd
            >
          </div>

          <!-- Results -->
          <div
            class="max-h-[360px] overflow-y-auto custom-scrollbar bg-ide-bg/95"
          >
            <template v-if="filteredCommands.length > 0">
              <template
                v-for="(cmds, category) in groupedCommands"
                :key="category"
              >
                <!-- Category Header -->
                <div
                  class="px-4 pt-3 pb-1 text-[9px] font-black uppercase tracking-widest text-ide-text-muted/60"
                >
                  {{ category }}
                </div>

                <!-- Commands in category -->
                <button
                  v-for="{ cmd, globalIndex } in cmds"
                  :key="cmd.id"
                  :ref="globalIndex === activeIndex ? 'activeItem' : undefined"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group"
                  :class="
                    globalIndex === activeIndex
                      ? 'bg-ide-accent/10 text-ide-text-bright'
                      : 'text-ide-text hover:bg-ide-activity/50'
                  "
                  @click="runCommand(cmd)"
                  @mouseenter="onMouseEnter(globalIndex)"
                >
                  <!-- Active indicator -->
                  <div
                    class="w-1 h-4 rounded-full shrink-0 transition-colors"
                    :class="
                      globalIndex === activeIndex
                        ? 'bg-ide-accent'
                        : 'bg-transparent'
                    "
                  />

                  <div class="flex-1 min-w-0">
                    <div class="text-[12px] font-bold tracking-tight truncate">
                      {{ cmd.label }}
                    </div>
                    <div
                      v-if="cmd.description"
                      class="text-[10px] text-ide-text-muted truncate mt-0.5"
                    >
                      {{ cmd.description }}
                    </div>
                  </div>

                  <kbd
                    v-if="cmd.shortcut"
                    class="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-mono border border-ide-border text-ide-text-muted bg-ide-activity opacity-70 group-hover:opacity-100"
                  >
                    {{ cmd.shortcut }}
                  </kbd>
                </button>
              </template>
            </template>

            <!-- Empty state -->
            <div
              v-else
              class="flex flex-col items-center justify-center py-12 text-ide-text-muted"
            >
              <svg
                class="w-8 h-8 mb-3 opacity-30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="text-[11px]">
                No commands match <em>{{ query }}</em>
              </p>
            </div>
          </div>

          <!-- Footer hint -->
          <div
            class="flex items-center gap-4 px-4 py-2 border-t border-ide-border bg-ide-activity/60 text-[9px] text-ide-text-muted font-mono"
          >
            <span class="flex items-center gap-1.5">
              <kbd
                class="px-1 py-0.5 rounded border border-ide-border bg-ide-activity"
                >↑↓</kbd
              >
              Navigate
            </span>
            <span class="flex items-center gap-1.5">
              <kbd
                class="px-1 py-0.5 rounded border border-ide-border bg-ide-activity"
                >↵</kbd
              >
              Run
            </span>
            <span class="flex items-center gap-1.5">
              <kbd
                class="px-1 py-0.5 rounded border border-ide-border bg-ide-activity"
                >ESC</kbd
              >
              Dismiss
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.palette-panel {
  border: 1px solid var(--theme-border);
  box-shadow:
    0 0 0 1px rgba(88, 166, 255, 0.06),
    0 32px 64px rgba(0, 0, 0, 0.6),
    0 8px 24px rgba(0, 0, 0, 0.4);
}
</style>
