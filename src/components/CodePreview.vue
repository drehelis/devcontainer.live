<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

const props = defineProps<{
  code: string;
  bashHistoryNote?: string;
  indentation: number;
}>();

const emit = defineEmits(["update:cursor"]);

const activeLine = ref(0);
const activeCol = ref(0);

const lines = ref<string[]>([]);

watch(
  () => props.code,
  (newCode) => {
    lines.value = newCode.split("\n");
  },
  { immediate: true },
);

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

function handleLineClick(lineIndex: number, event: MouseEvent) {
  // Rough estimation of column based on click position relative to the code content
  const codeSpan = (event.currentTarget as HTMLElement).querySelector(
    ".code-content",
  );
  if (codeSpan) {
    const rect = codeSpan.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const charWidth = 7.8; // Approximate width of a monospace character at 13px
    const col = Math.round(clickX / charWidth);
    updateCursor(lineIndex, col);
  } else {
    updateCursor(lineIndex, 0);
  }
}

function handleKeyDown(e: KeyboardEvent) {
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
        const prevLineLen = lines.value[activeLine.value - 1].length;
        updateCursor(activeLine.value - 1, prevLineLen);
      }
    } else if (e.key === "ArrowRight") {
      const currentLineLen = lines.value[activeLine.value].length;
      if (activeCol.value < currentLineLen) {
        updateCursor(activeLine.value, activeCol.value + 1);
      } else if (activeLine.value < lines.value.length - 1) {
        updateCursor(activeLine.value + 1, 0);
      }
    }
  }
}

onMounted(() => {
  updateCursor(0, 0);
});
</script>

<template>
  <div
    class="font-mono text-[13px] leading-6 selection:bg-ide-accent/20 h-full w-full outline-none focus:ring-0"
    tabindex="0"
    @keydown="handleKeyDown"
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
                :style="{ width: indentation * 7.8 + 'px' }"
                >·</span
              >
            </template>
            <template v-else-if="indentation === -1">
              <span
                v-for="i in getLineStructure(line).leading.length"
                :key="i"
                class="inline-block opacity-10 select-none pointer-events-none border-l border-ide-text-bright"
                :style="{ width: '31.2px' }"
                >&nbsp;</span
              >
            </template>
          </div>

          <!-- Actual Code -->
          <div class="flex-1">
            <span
              v-for="(part, pIndex) in highlight(
                getLineStructure(line).content,
              )"
              :key="pIndex"
              :class="part.class"
            >
              {{ part.text }}
            </span>
          </div>

          <!-- Virtual Cursor -->
          <div
            v-if="activeLine === index"
            class="absolute top-0 bottom-0 w-[2px] bg-ide-accent animate-pulse pointer-events-none"
            :style="{ left: activeCol * 7.8 + 'px' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    highlight(text: string) {
      if (!text.trim()) return [{ text: "", class: "" }];

      const parts: { text: string; class: string }[] = [];
      const jsonRegex = /(".*?")(?:\s*:)?|(\d+)|true|false|null|[{}[\],]/g;
      let lastIndex = 0;
      let match;

      while ((match = jsonRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push({
            text: text.substring(lastIndex, match.index),
            class: "text-ide-text",
          });
        }

        const value = match[0];
        let className = "text-ide-text";

        if (value.startsWith('"')) {
          if (text[match.index + value.length] === ":") {
            className = "text-ide-accent font-black"; // Key
          } else {
            className = "text-ide-orange"; // String Value
          }
        } else if (!isNaN(Number(value))) {
          className = "text-ide-purple"; // Number
        } else if (["true", "false", "null"].includes(value)) {
          className = "text-ide-green font-bold"; // Boolean/Null
        } else if (["{", "}", "[", "]", ",", ":"].includes(value)) {
          className = "text-ide-text-muted/50"; // Punctuation
        }

        parts.push({ text: value, class: className });
        lastIndex = match.index + value.length;
      }

      if (lastIndex < text.length) {
        parts.push({ text: text.substring(lastIndex), class: "text-ide-text" });
      }

      return parts;
    },
  },
};
</script>
