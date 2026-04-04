<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useResponsive } from "../../composables/useResponsive";
import { URLS } from "../../constants/urls";
import IconFile from "../ui/icons/IconFile.vue";
import IconChevronRight from "../ui/icons/IconChevronRight.vue";
import IconChevronDown from "../ui/icons/IconChevronDown.vue";
import IconCopy from "../ui/icons/IconCopy.vue";
import IconTerminal from "../ui/icons/IconTerminal.vue";
import IconCheck from "../ui/icons/IconCheck.vue";
import IconShare from "../ui/icons/IconShare.vue";
import IconDownload from "../ui/icons/IconDownload.vue";
import IconTrash from "../ui/icons/IconTrash.vue";
import IconGithub from "../ui/icons/IconGithub.vue";

defineProps<{
  copyStatus: "idle" | "copied";
  shareStatus: "idle" | "copied";
  oneLinerStatus: "idle" | "copied";
  files: string[];
  activeFile: string;
}>();

const emit = defineEmits<{
  (e: "copy"): void;
  (e: "share"): void;
  (e: "one-liner"): void;
  (e: "download"): void;
  (e: "reset"): void;
  (e: "update:activeFile", file: string): void;
}>();

const { isMobile } = useResponsive();
const showCopyMenu = ref(false);

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (showCopyMenu.value && !target.closest(".copy-dropdown-container")) {
    showCopyMenu.value = false;
  }
}

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div
    class="h-9 bg-ide-sidebar border-b border-ide-border flex items-center justify-between z-20"
  >
    <div class="relative flex-1 h-full min-w-0 overflow-hidden">
      <!-- Left fade indicator (only really needed if we want to show it's scrolled) -->
      <div
        class="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-ide-sidebar to-transparent z-10 pointer-events-none opacity-0 transition-opacity"
        :class="{ 'opacity-100': isMobile }"
      ></div>

      <div class="flex h-full overflow-x-auto no-scrollbar scroll-smooth">
        <div
          v-for="file in files"
          :key="file"
          class="tab-item text-[11px] font-bold tracking-tight px-4 flex items-center gap-2 cursor-pointer transition-all border-r border-ide-border select-none whitespace-nowrap min-w-fit"
          :class="
            activeFile === file
              ? 'active bg-ide-bg text-ide-accent border-t-2 border-t-ide-accent h-full'
              : 'text-ide-text-muted hover:bg-ide-bg/40'
          "
          @click="$emit('update:activeFile', file)"
        >
          <!-- Generic Document Icon for Desktop -->
          <IconFile
            v-if="!isMobile"
            size="14"
            :class="activeFile === file ? 'opacity-80' : 'opacity-30'"
            stroke-width="2"
          />
          <span>{{ file }}</span>
        </div>
      </div>

      <!-- Right fade indicator -->
      <div
        class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-ide-sidebar to-transparent z-10 pointer-events-none"
        :class="{ 'hidden sm:block': !isMobile }"
      >
        <!-- Optional: small chevron hint -->
        <div
          class="h-full flex items-center justify-end pr-1 text-ide-accent/40 lg:hidden"
        >
          <IconChevronRight size="10" stroke-width="4" />
        </div>
      </div>
    </div>

    <div class="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 relative">
      <!-- Copy Dropdown -->
      <div class="relative copy-dropdown-container">
        <button
          @click="showCopyMenu = !showCopyMenu"
          class="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-ide-accent/10 transition-colors text-ide-text-muted hover:text-ide-text-bright group"
          :class="{ 'bg-ide-accent/10 text-ide-text-bright': showCopyMenu }"
          title="Copy Options"
        >
          <IconCopy class="w-4 h-4 lg:w-3.5 lg:h-3.5" stroke-width="2" />
          <span
            v-if="!isMobile"
            class="text-[10px] font-bold uppercase tracking-widest"
            >Copy</span
          >
          <IconChevronDown
            size="10"
            stroke-width="3"
            class="opacity-50 transition-transform duration-200"
            :class="{ 'rotate-180': showCopyMenu }"
          />
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showCopyMenu"
          class="absolute top-full right-0 mt-2 w-48 bg-ide-sidebar border border-ide-border rounded-lg shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <button
            @click="$emit('copy')"
            class="w-full flex items-center relative px-3 py-2 hover:bg-ide-accent/10 transition-colors group text-left"
          >
            <div class="flex items-center gap-2 flex-1 min-w-0 pr-6">
              <IconFile
                size="14"
                class="text-ide-text-muted group-hover:text-ide-accent transition-colors shrink-0"
                stroke-width="2"
              />
              <div class="flex flex-col min-w-0">
                <span
                  class="text-[10px] font-bold uppercase tracking-tight text-ide-text-bright truncate"
                  >Copy to Clipboard</span
                >
                <span class="text-[9px] text-ide-text-muted truncate"
                  >Clipboard active file</span
                >
              </div>
            </div>
            <IconCheck
              v-if="copyStatus === 'copied'"
              size="14"
              stroke-width="3"
              class="text-ide-green absolute right-3"
            />
          </button>

          <div class="h-px bg-ide-border mx-2 my-1"></div>

          <button
            @click="$emit('one-liner')"
            class="w-full flex items-center relative px-3 py-2 hover:bg-ide-accent/10 transition-colors group text-left"
          >
            <div class="flex items-center gap-2 flex-1 min-w-0 pr-6">
              <IconTerminal
                size="14"
                stroke-width="2"
                class="text-ide-text-muted group-hover:text-ide-accent transition-colors shrink-0"
              />
              <div class="flex flex-col min-w-0">
                <span
                  class="text-[10px] font-bold uppercase tracking-tight text-ide-text-bright truncate"
                  >Copy Scaffolding</span
                >
                <span class="text-[9px] text-ide-text-muted truncate"
                  >Bash one-liner command</span
                >
              </div>
            </div>
            <IconCheck
              v-if="oneLinerStatus === 'copied'"
              size="14"
              stroke-width="3"
              class="text-ide-green absolute right-3"
            />
          </button>
        </div>
      </div>

      <button
        @click="$emit('share')"
        class="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-ide-accent/10 transition-colors text-ide-text-muted hover:text-ide-text-bright group"
        :title="
          shareStatus === 'copied' ? 'Link Copied' : 'Share Configuration'
        "
      >
        <IconShare
          v-if="shareStatus === 'idle'"
          class="w-4 h-4 lg:w-3.5 lg:h-3.5"
          stroke-width="2"
        />
        <IconCheck
          v-else
          class="w-4 h-4 lg:w-3.5 lg:h-3.5 text-ide-green"
          stroke-width="3"
        />
        <span
          v-if="!isMobile"
          class="text-[10px] font-bold uppercase tracking-widest"
          >{{ shareStatus === "copied" ? "Linked" : "Share" }}</span
        >
      </button>

      <button
        @click="$emit('download')"
        class="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-ide-accent/10 transition-colors text-ide-text-muted hover:text-ide-text-bright"
        title="Download devcontainer.json"
      >
        <IconDownload class="w-4 h-4 lg:w-3.5 lg:h-3.5" stroke-width="2" />
        <span
          v-if="!isMobile"
          class="text-[10px] font-bold uppercase tracking-widest"
          >Download</span
        >
      </button>

      <div class="w-px h-3 bg-ide-border mx-1"></div>

      <button
        @click="$emit('reset')"
        class="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-ide-red/10 transition-colors text-ide-red/80 hover:text-ide-red group"
        title="Reset to Template"
      >
        <IconTrash class="w-4 h-4 lg:w-3.5 lg:h-3.5" stroke-width="2" />
        <span
          v-if="!isMobile"
          class="text-[10px] font-bold uppercase tracking-widest"
          >Reset</span
        >
      </button>

      <div v-if="isMobile" class="w-px h-3 bg-ide-border mx-1"></div>

      <a
        v-if="isMobile"
        :href="URLS.REPO_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-ide-accent/10 transition-colors text-ide-text-muted hover:text-ide-text group"
        title="View Source on GitHub"
      >
        <IconGithub size="14" />
      </a>
    </div>
  </div>
</template>
