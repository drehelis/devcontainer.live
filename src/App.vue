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
import MobileNav from "./components/layout/MobileNav.vue";
import MobileSectionNav from "./components/layout/MobileSectionNav.vue";
import StatusBar from "./components/layout/StatusBar.vue";
import EditorTabs from "./components/layout/EditorTabs.vue";
import { useResponsive } from "./composables/useResponsive";
import IndentationPicker from "./components/layout/IndentationPicker.vue";
import PresetsGallery from "./components/presets/PresetsGallery.vue";

const {
  state,
  allFiles,
  extraNotes,
  indentation,
  reset: resetGenerator,
  getShareUrl,
} = useGenerator();

const activeFile = ref("devcontainer.json");

function reset() {
  resetGenerator();
  activeFile.value = "devcontainer.json";
}
const { currentTheme } = useTheme();
const { sidebarWidth, startResizing } = useSidebarResize();
const {
  copyStatus,
  shareStatus,
  showIndentMenu,
  copyToClipboard,
  copyShareLink,
  downloadConfig,
} = useEditorActions(allFiles, activeFile, reset, getShareUrl);

const { isMobile } = useResponsive();
const activeView = ref<"config" | "preview">("config");

const activeSection = ref<
  "general" | "features" | "ports" | "history" | "advanced" | "presets"
>("presets");

function handleApplyPreset(payload: any) {
  state.value.orchestration = payload.orchestration;
  state.value.config = {
    ...state.value.config,
    ...JSON.parse(JSON.stringify(payload.config)),
  };

  // Store additional files if they exist
  const presetFiles: Record<string, string> = {};
  if (payload.dockerfile) presetFiles["Dockerfile"] = payload.dockerfile;
  if (payload.dockerCompose)
    presetFiles["docker-compose.yml"] = payload.dockerCompose;
  state.value.presetFiles = presetFiles;

  activeFile.value = "devcontainer.json";
  activeSection.value = "general";
}

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
    class="h-[100dvh] w-screen flex flex-col bg-ide-bg overflow-hidden text-[13px] transition-colors duration-300"
  >
    <!-- Main Layout -->
    <div class="flex-1 flex overflow-hidden">
      <ActivityBar
        v-model:active-section="activeSection"
        class="hidden lg:flex"
      />

      <!-- Sidebar -->
      <section
        v-show="!isMobile || activeView === 'config'"
        class="bg-ide-sidebar border-r border-ide-border flex flex-col z-10 relative"
        :class="isMobile ? 'flex-1' : ''"
        :style="{ width: isMobile ? '100%' : sidebarWidth + 'px' }"
      >
        <MobileSectionNav v-model:active-section="activeSection" />

        <header
          class="h-9 hidden lg:flex items-center px-4 bg-ide-activity border-b border-ide-border text-[10px] font-black uppercase tracking-widest text-ide-text"
        >
          Configuration
        </header>
        <div class="flex-1 overflow-x-hidden flex flex-col custom-scrollbar">
          <div class="p-4 lg:pt-4 pt-2 flex-1 flex flex-col min-h-0">
            <PresetsGallery
              v-if="activeSection === 'presets'"
              @apply="handleApplyPreset"
            />
            <ConfigForm v-else v-model="state" :activeSection="activeSection" />
          </div>
        </div>

        <!-- Resize Handle (Hidden on Mobile) -->
        <div
          v-if="!isMobile"
          class="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-ide-accent/30 transition-colors z-30"
          @mousedown="startResizing"
        ></div>
      </section>

      <!-- Editor Area -->
      <main
        v-show="!isMobile || activeView === 'preview'"
        class="flex-1 flex flex-col overflow-hidden relative"
      >
        <div class="absolute inset-0 grid-overlay pointer-events-none"></div>

        <EditorTabs
          :files="Object.keys(allFiles)"
          v-model:active-file="activeFile"
          :copy-status="copyStatus"
          :share-status="shareStatus"
          @copy="copyToClipboard"
          @share="copyShareLink"
          @download="downloadConfig"
          @reset="reset"
        />

        <div
          class="flex-1 overflow-auto bg-ide-bg p-4 lg:p-8 font-mono custom-scrollbar z-10 transition-colors duration-300"
        >
          <CodePreview
            :code="allFiles[activeFile]?.content || ''"
            :language="allFiles[activeFile]?.language || 'json'"
            :extra-notes="
              activeFile === 'devcontainer.json' ? extraNotes : undefined
            "
            :indentation="indentation"
            @update:cursor="handleCursorUpdate"
          />
        </div>
      </main>
    </div>

    <!-- Bottom Nav for Mobile -->
    <MobileNav v-model:active-view="activeView" :version="pkgVersion" />

    <StatusBar
      class="hidden lg:flex"
      :version="pkgVersion"
      :cursor-pos="cursorPos"
      v-model:indentation="indentation"
      :indent-editable="activeFile === 'devcontainer.json'"
      @toggle-indent-menu="showIndentMenu = !showIndentMenu"
    >
      <template #indent-menu>
        <IndentationPicker
          v-if="showIndentMenu"
          v-model="indentation"
          @close="showIndentMenu = false"
        />
      </template>
    </StatusBar>
  </div>
</template>
