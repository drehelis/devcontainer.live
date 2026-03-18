<script setup lang="ts">
import { useResponsive } from "../../composables/useResponsive";

defineProps<{
  copyStatus: "idle" | "copied";
  shareStatus: "idle" | "copied";
}>();

const emit = defineEmits<{
  (e: "copy"): void;
  (e: "share"): void;
  (e: "download"): void;
  (e: "reset"): void;
}>();

const { isMobile } = useResponsive();
</script>

<template>
  <div
    class="h-9 bg-ide-sidebar border-b border-ide-border flex items-center justify-between z-20"
  >
    <div class="flex h-full">
      <div class="tab-item active">
        <span>devcontainer.json</span>
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
    </div>
  </div>
</template>
