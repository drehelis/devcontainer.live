<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { ThemedToken } from "shiki";
import { useShiki } from "../composables/useShiki";

const props = defineProps<{
  code: string;
  bashHistoryNote?: string;
  indentation: number;
}>();

const emit = defineEmits<{
  (e: "update:cursor", pos: { line: number; col: number }): void;
}>();

const { highlightCode } = useShiki();

const activeLine = ref(0);
const activeCol = ref(0);
const lines = ref<string[]>([]);
const highlightedLines = ref<ThemedToken[][]>([]);

// Rough width of a character in Geist Mono text-[13px]
const CHAR_WIDTH = 7.8;

watch(
  () => props.code,
  async (newCode) => {
    lines.value = newCode.split("\n");
    await renderHighlightedCode();
  },
  { immediate: true },
);

async function renderHighlightedCode() {
  const result = await highlightCode(props.code, "json");

  // Process tokens to remove leading whitespace that we render separately as visualizers
  highlightedLines.value = result.map((lineTokens, i) => {
    const lineText = lines.value[i] || "";
    const { leading } = getLineStructure(lineText);
    const leadingLen = leading.length;

    if (leadingLen === 0) return lineTokens;

    let currentLen = 0;
    const newTokens: ThemedToken[] = [];

    for (const token of lineTokens) {
      if (currentLen >= leadingLen) {
        newTokens.push(token);
      } else if (currentLen + token.content.length > leadingLen) {
        newTokens.push({
          ...token,
          content: token.content.slice(leadingLen - currentLen),
        });
        currentLen = leadingLen;
      } else {
        currentLen += token.content.length;
      }
    }
    return newTokens;
  });
}

function getLineStructure(line: string) {
  const match = line.match(/^(\s*)(.*)$/);
  const leading = match ? match[1] : "";
  const content = match ? match[2] : "";
  return { leading, content };
}

function updateCursor(line: number, col: number) {
  const maxLine = lines.value.length - 1;
  activeLine.value = Math.max(0, Math.min(line, maxLine));

  const currentLineText = lines.value[activeLine.value] || "";
  activeCol.value = Math.max(0, Math.min(col, currentLineText.length));

  emit("update:cursor", {
    line: activeLine.value + 1,
    col: activeCol.value + 1,
  });
}

const handleLineClick = (lineIndex: number, event: MouseEvent) => {
  const codeSpan = (event.currentTarget as HTMLElement).querySelector(
    ".code-content",
  );
  if (codeSpan) {
    const rect = codeSpan.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const col = Math.round(clickX / CHAR_WIDTH);
    updateCursor(lineIndex, col);
  } else {
    updateCursor(lineIndex, 0);
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();

    if (e.key === "ArrowUp") {
      updateCursor(activeLine.value - 1, activeCol.value);
    } else if (e.key === "ArrowDown") {
      updateCursor(activeLine.value + 1, activeCol.value);
    } else if (e.key === "ArrowLeft") {
      if (activeCol.value > 0) {
        updateCursor(activeLine.value, activeCol.value - 1);
      } else if (activeLine.value > 0) {
        const prevLineLen = lines.value[activeLine.value - 1]?.length || 0;
        updateCursor(activeLine.value - 1, prevLineLen);
      }
    } else if (e.key === "ArrowRight") {
      const currentLineLen = lines.value[activeLine.value]?.length || 0;
      if (activeCol.value < currentLineLen) {
        updateCursor(activeLine.value, activeCol.value + 1);
      } else if (activeLine.value < lines.value.length - 1) {
        updateCursor(activeLine.value + 1, 0);
      }
    }
  }
};

onMounted(() => {
  updateCursor(0, 0);
});
</script>

<template>
  <div
    class="font-mono text-[13px] leading-6 selection:bg-ide-accent/20 h-full w-full outline-none focus:ring-0"
    tabindex="0"
    @keydown="handleKeyDown"
    style="tab-size: 4;"
  >
    <div
      v-if="bashHistoryNote"
      class="mb-2 p-2 bg-ide-accent/10 border border-ide-accent/30 rounded text-[10px] text-ide-text-muted"
    >
      {{ bashHistoryNote }}
    </div>
    <div class="flex flex-col min-h-full">
      <div
        v-for="(line, index) in lines"
        :key="index"
        class="relative group flex items-start px-2 cursor-text transition-colors border-l-2 min-w-fit"
        :class="[
          activeLine === index
            ? 'bg-ide-accent/5 border-ide-accent'
            : 'hover:bg-ide-accent-muted/5 border-transparent hover:border-ide-accent/30',
        ]"
        @click="handleLineClick(index, $event)"
      >
        <!-- Line Numbers -->
        <span
          class="w-12 shrink-0 inline-block text-right pr-4 select-none group-hover:text-ide-accent/40 font-bold transition-colors"
          :class="
            activeLine === index
              ? 'text-ide-accent/60'
              : 'text-ide-text-muted/30'
          "
        >
          {{ index + 1 }}
        </span>

        <!-- Code Content -->
        <div
          class="whitespace-pre flex-1 code-content relative flex items-start"
        >
          <!-- Indentation Visualizers -->
          <div class="flex shrink-0">
            <template v-if="indentation > 0">
              <span
                v-for="i in Math.floor(
                  getLineStructure(line).leading.length / indentation,
                )"
                :key="i"
                class="inline-block opacity-10 select-none pointer-events-none text-ide-text-bright"
                :style="{ width: indentation * CHAR_WIDTH + 'px' }"
                >·</span
              >
            </template>
            <template v-else-if="indentation === -1">
              <span
                v-for="i in getLineStructure(line).leading.length"
                :key="i"
                class="inline-block opacity-10 select-none pointer-events-none border-l border-ide-text-bright"
                :style="{ width: 4 * CHAR_WIDTH + 'px' }"
                >&nbsp;</span
              >
            </template>
          </div>

          <!-- Actual Code (Shiki Highlighted) -->
          <div class="flex-1">
            <template v-if="highlightedLines[index]">
              <span
                v-for="(token, tIndex) in highlightedLines[index]"
                :key="tIndex"
                :style="{ color: token.color }"
                :class="{
                  'font-bold': token.fontStyle === 1,
                  'italic': token.fontStyle === 2,
                  'underline': token.fontStyle === 4,
                }"
                >{{ token.content }}</span
              >
            </template>
            <template v-else>
              <span class="text-ide-text">{{ getLineStructure(line).content }}</span>
            </template>
          </div>

          <!-- Virtual Cursor -->
          <div
            v-if="activeLine === index"
            class="absolute top-0 bottom-0 w-[2px] bg-ide-accent animate-pulse pointer-events-none"
            :style="{ left: activeCol * CHAR_WIDTH + 'px' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(:root, [class*="theme-"]) {
  --shiki-foreground: var(--theme-text);
  --shiki-background: transparent;
  --shiki-token-constant: var(--theme-purple);
  --shiki-token-string: var(--theme-orange);
  --shiki-token-comment: var(--theme-text-muted);
  --shiki-token-keyword: var(--theme-purple);
  --shiki-token-parameter: var(--theme-cyan);
  --shiki-token-function: var(--theme-accent);
  --shiki-token-string-expression: var(--theme-green);
  --shiki-token-punctuation: var(--theme-text-muted);
  --shiki-token-link: var(--theme-accent);
}
</style>

