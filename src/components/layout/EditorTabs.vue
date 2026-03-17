<script setup lang="ts">
defineProps<{
  copyStatus: "idle" | "copied";
  shareStatus: "idle" | "copied";
}>();

defineEmits<{
  (e: "copy"): void;
  (e: "share"): void;
  (e: "download"): void;
  (e: "reset"): void;
}>();
</script>

<template>
  <div
    class="h-9 bg-ide-sidebar border-b border-ide-border flex items-center justify-between z-20"
  >
    <div class="flex h-full">
      <div class="tab-item active">
        <span class="text-ide-purple text-[10px] font-bold">{ }</span>
        <span>devcontainer.json</span>
      </div>
    </div>

    <div class="flex items-center gap-2 px-4">
      <button
        @click="$emit('copy')"
        class="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-ide-accent/10 transition-colors text-ide-text-muted hover:text-ide-text-bright group"
      >
        <svg
          v-if="copyStatus === 'idle'"
          class="w-3.5 h-3.5"
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
          class="w-3.5 h-3.5 text-ide-green"
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
        <span class="text-[10px] font-bold uppercase tracking-widest">{{
          copyStatus === "copied" ? "Copied" : "Copy"
        }}</span>
      </button>
      <button
        @click="$emit('share')"
        class="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-ide-accent/10 transition-colors text-ide-text-muted hover:text-ide-text-bright group"
      >
        <svg
          v-if="shareStatus === 'idle'"
          class="w-3.5 h-3.5"
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
          class="w-3.5 h-3.5 text-ide-green"
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
        <span class="text-[10px] font-bold uppercase tracking-widest">{{
          shareStatus === "copied" ? "Linked" : "Share"
        }}</span>
      </button>
      <button
        @click="$emit('download')"
        class="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-ide-accent/10 transition-colors text-ide-text-muted hover:text-ide-text-bright"
      >
        <svg
          class="w-3.5 h-3.5"
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
        <span class="text-[10px] font-bold uppercase tracking-widest"
          >Download</span
        >
      </button>
      <div class="w-px h-3 bg-ide-border mx-1"></div>
      <button
        @click="$emit('reset')"
        class="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-ide-accent/10 transition-colors text-ide-text-muted hover:text-ide-red group"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span class="text-[10px] font-bold uppercase tracking-widest"
          >Reset</span
        >
      </button>
    </div>
  </div>
</template>
