<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { version as pkgVersion } from "../package.json";
import { useGenerator } from "./composables/useGenerator";
import { useTheme } from "./composables/useTheme";
import { useSidebarResize } from "./composables/useSidebarResize";
import { useEditorActions } from "./composables/useEditorActions";
import { useCommandPalette } from "./composables/useCommandPalette";
import ConfigForm from "./components/ConfigForm.vue";
import CodePreview from "./components/CodePreview.vue";
import ActivityBar from "./components/layout/ActivityBar.vue";
import CommandPalette from "./components/layout/CommandPalette.vue";
import MobileNav from "./components/layout/MobileNav.vue";
import MobileSectionNav from "./components/layout/MobileSectionNav.vue";
import StatusBar from "./components/layout/StatusBar.vue";
import EditorTabs from "./components/layout/EditorTabs.vue";
import { useResponsive } from "./composables/useResponsive";
import IndentationPicker from "./components/layout/IndentationPicker.vue";
import PresetsGallery from "./components/presets/PresetsGallery.vue";
import type { PresetApplyPayload, Section } from "./types";

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
const { currentTheme, themes, setTheme } = useTheme();
const { sidebarWidth, startResizing } = useSidebarResize();
const {
  copyStatus,
  shareStatus,
  oneLinerStatus,
  showIndentMenu,
  copyToClipboard,
  copyOneLiner,
  copyShareLink,
  downloadConfig,
} = useEditorActions(allFiles, activeFile, reset, getShareUrl);

const { isMobile } = useResponsive();
const activeView = ref<"config" | "preview">("config");

const activeSection = ref<Section>("presets");

const { register, toggle: togglePalette } = useCommandPalette();

const SECTIONS: { id: Section; label: string; description: string }[] = [
  {
    id: "presets",
    label: "Templates",
    description: "Browse official dev container templates",
  },
  {
    id: "general",
    label: "General Settings",
    description: "Configure image, orchestration, workspace",
  },
  {
    id: "features",
    label: "Features",
    description: "Add dev container features and VS Code extensions",
  },
  {
    id: "ports",
    label: "Network & Ports",
    description: "Forward ports and configure networking",
  },
  {
    id: "mounts",
    label: "Mounts & Volumes",
    description: "Bind mounts, volumes, secrets, SSH",
  },
  {
    id: "advanced",
    label: "Advanced & Hooks",
    description: "Lifecycle hooks, security, environment",
  },
];

function handleApplyPreset(payload: PresetApplyPayload) {
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

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (showIndentMenu.value && !target.closest(".indent-selector")) {
    showIndentMenu.value = false;
  }
}

function handleKeydown(e: KeyboardEvent) {
  const isP = e.key.toLowerCase() === "p";
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && isP) {
    e.preventDefault();
    togglePalette();
  }
}

onMounted(() => {
  window.addEventListener("click", handleClick);
  window.addEventListener("keydown", handleKeydown);

  register([
    // ── Navigate
    ...SECTIONS.map((s) => ({
      id: `nav:${s.id}`,
      label: `Go to: ${s.label}`,
      description: s.description,
      category: "Navigate",
      action: () => {
        activeSection.value = s.id;
      },
    })),

    // ── Actions
    {
      id: "action:copy",
      label: "Copy Config",
      description: "Copy the active file content to clipboard",
      shortcut: "⌘C",
      category: "Actions",
      action: copyToClipboard,
    },
    {
      id: "action:share",
      label: "Copy Share Link",
      description: "Generate and copy a shareable URL",
      shortcut: "⌘S",
      category: "Actions",
      action: copyShareLink,
    },
    {
      id: "action:one-liner",
      label: "Copy One-liner",
      description: "Copy a shell command to scaffold .devcontainer files",
      category: "Actions",
      action: copyOneLiner,
    },
    {
      id: "action:download",
      label: "Download Config",
      description: "Download devcontainer.json (or ZIP for multi-file)",
      category: "Actions",
      action: downloadConfig,
    },
    {
      id: "action:reset",
      label: "Reset to Default",
      description: "Clear all settings and start fresh",
      category: "Actions",
      action: reset,
    },

    // ── Theme
    ...themes.map((t) => ({
      id: `theme:${t.id}`,
      label: `Theme: ${t.name}`,
      description: `Switch to the ${t.name} color theme`,
      category: "Theme",
      action: () => setTheme(t.id),
    })),
  ]);
});

onUnmounted(() => {
  window.removeEventListener("click", handleClick);
  window.removeEventListener("keydown", handleKeydown);
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
    <!-- Command Palette (global, Teleported to body) -->
    <CommandPalette />

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
          :one-liner-status="oneLinerStatus"
          @copy="copyToClipboard"
          @share="copyShareLink"
          @one-liner="copyOneLiner"
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
