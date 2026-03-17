<script setup lang="ts">
import { ref, onMounted } from "vue";
import { version as pkgVersion } from "../package.json";
import { useGenerator } from "./composables/useGenerator";
import { useTheme } from "./composables/useTheme";
import { useSidebarResize } from "./composables/useSidebarResize";
import { useEditorActions } from "./composables/useEditorActions";
import ConfigForm from "./components/ConfigForm.vue";
import CodePreview from "./components/CodePreview.vue";
import ActivityBar from "./components/layout/ActivityBar.vue";
import StatusBar from "./components/layout/StatusBar.vue";
import EditorTabs from "./components/layout/EditorTabs.vue";

const { state, generatedJson, bashHistoryNote, indentation, reset } =
  useGenerator();
const { currentTheme } = useTheme();
const { sidebarWidth, startResizing } = useSidebarResize();
const { copyStatus, showIndentMenu, copyToClipboard, downloadConfig } =
  useEditorActions(generatedJson, reset);

const activeSection = ref<
  "general" | "features" | "ports" | "history" | "advanced"
>("general");

const indentOptions = [
  { id: "2", name: "Spaces: 2", value: 2 },
  { id: "4", name: "Spaces: 4", value: 4 },
  { id: "tabs", name: "Tabs", value: -1 },
];

onMounted(() => {
  window.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (showIndentMenu.value && !target.closest(".indent-selector")) {
      showIndentMenu.value = false;
    }
  });
});

const cursorPos = ref({ line: 1, col: 1 });
function handleCursorUpdate(pos: { line: number; col: number }) {
  cursorPos.value = pos;
}
</script>

<template>
  <div
    :class="currentTheme.class"
    class="h-screen w-screen flex flex-col bg-ide-bg overflow-hidden text-[13px] transition-colors duration-300"
  >
    <!-- Main Layout -->
    <div class="flex-1 flex overflow-hidden">
      <ActivityBar v-model:active-section="activeSection" />

      <!-- Sidebar -->
      <section
        class="bg-ide-sidebar border-r border-ide-border flex flex-col z-10 relative"
        :style="{ width: sidebarWidth + 'px' }"
      >
        <header
          class="h-9 flex items-center px-4 bg-ide-activity border-b border-ide-border text-[10px] font-black uppercase tracking-widest text-ide-text"
        >
          Configuration
        </header>
        <div
          class="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar"
        >
          <ConfigForm v-model="state" :activeSection="activeSection" />
        </div>

        <!-- Resize Handle -->
        <div
          class="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-ide-accent/30 transition-colors z-30"
          @mousedown="startResizing"
        ></div>
      </section>

      <!-- Editor Area -->
      <main class="flex-1 flex flex-col overflow-hidden relative">
        <div class="absolute inset-0 grid-overlay pointer-events-none"></div>

        <EditorTabs
          :copy-status="copyStatus"
          @copy="copyToClipboard"
          @download="downloadConfig"
          @reset="reset"
        />

        <div
          class="flex-1 overflow-auto bg-ide-bg p-8 font-mono custom-scrollbar z-10 transition-colors duration-300"
        >
          <CodePreview
            :code="generatedJson"
            :bash-history-note="bashHistoryNote"
            :indentation="indentation"
            @update:cursor="handleCursorUpdate"
          />
        </div>
      </main>
    </div>

    <StatusBar
      :version="pkgVersion"
      :cursor-pos="cursorPos"
      v-model:indentation="indentation"
      @toggle-indent-menu="showIndentMenu = !showIndentMenu"
    >
      <template #indent-menu>
        <div
          v-if="showIndentMenu"
          class="absolute bottom-full right-0 mb-2 w-32 bg-ide-sidebar border border-ide-border rounded-lg shadow-2xl z-[100] overflow-hidden"
        >
          <div
            v-for="opt in indentOptions"
            :key="opt.id"
            @click="
              indentation = opt.value;
              showIndentMenu = false;
            "
            class="px-4 py-2 hover:bg-ide-accent/10 hover:text-ide-accent cursor-pointer transition-colors flex items-center justify-between"
            :class="{
              'bg-ide-accent/5 text-ide-accent font-black':
                indentation === opt.value,
            }"
          >
            <span>{{ opt.name }}</span>
            <svg
              v-if="indentation === opt.value"
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
      </template>
    </StatusBar>
  </div>
</template>
