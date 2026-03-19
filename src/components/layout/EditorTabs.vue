<script setup lang="ts">
import { useResponsive } from "../../composables/useResponsive";

defineProps<{
  copyStatus: "idle" | "copied";
  shareStatus: "idle" | "copied";
  files: string[];
  activeFile: string;
}>();

const emit = defineEmits<{
  (e: "copy"): void;
  (e: "share"): void;
  (e: "download"): void;
  (e: "reset"): void;
  (e: "update:activeFile", file: string): void;
}>();

const { isMobile } = useResponsive();
</script>

<template>
  <div
    class="h-9 bg-ide-sidebar border-b border-ide-border flex items-center justify-between z-20"
  >
    <div class="flex h-full overflow-x-auto no-scrollbar">
      <div
        v-for="file in files"
        :key="file"
        class="tab-item text-[11px] font-bold tracking-tight px-4 flex items-center justify-center cursor-pointer transition-all border-r border-ide-border select-none"
        :class="
          activeFile === file
            ? 'active bg-ide-bg text-ide-accent border-t-2 border-t-ide-accent h-full'
            : 'text-ide-text-muted hover:bg-ide-bg/40'
        "
        @click="$emit('update:activeFile', file)"
      >
        <span>{{ file }}</span>
      </div>
    </div>

    <div class="flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
      <button
        @click="$emit('copy')"
        class="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-ide-accent/10 transition-colors text-ide-text-muted hover:text-ide-text-bright group"
        :title="copyStatus === 'copied' ? 'Copied' : 'Copy JSON'"
      >
        <svg
          v-if="copyStatus === 'idle'"
          class="w-4 h-4 lg:w-3.5 lg:h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3"
          />
        </svg>
        <svg
          v-else
          class="w-4 h-4 lg:w-3.5 lg:h-3.5 text-ide-green"
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
        <span
          v-if="!isMobile"
          class="text-[10px] font-bold uppercase tracking-widest"
          >{{ copyStatus === "copied" ? "Copied" : "Copy" }}</span
        >
      </button>

      <button
        @click="$emit('share')"
        class="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-ide-accent/10 transition-colors text-ide-text-muted hover:text-ide-text-bright group"
        :title="
          shareStatus === 'copied' ? 'Link Copied' : 'Share Configuration'
        "
      >
        <svg
          v-if="shareStatus === 'idle'"
          class="w-4 h-4 lg:w-3.5 lg:h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        <svg
          v-else
          class="w-4 h-4 lg:w-3.5 lg:h-3.5 text-ide-green"
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
        <svg
          class="w-4 h-4 lg:w-3.5 lg:h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
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
        <svg
          class="w-4 h-4 lg:w-3.5 lg:h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span
          v-if="!isMobile"
          class="text-[10px] font-bold uppercase tracking-widest"
          >Reset</span
        >
      </button>

      <div class="w-px h-3 bg-ide-border mx-1"></div>

      <a
        href="https://github.com/drehelis/devcontainer.live"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-ide-accent/10 transition-colors text-ide-text-muted hover:text-ide-text group"
        title="View Source on GitHub"
      >
        <svg
          class="w-4 h-4 lg:w-3.5 lg:h-3.5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-11.999-12-11.999z"
          />
        </svg>
      </a>
    </div>
  </div>
</template>
