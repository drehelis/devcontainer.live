<script setup lang="ts">
import { ref } from "vue";
import type { OfficialTemplate } from "../../types";
import { URLS } from "../../constants/urls";

defineProps<{
  preset: OfficialTemplate;
  loading?: boolean;
}>();

defineEmits<{
  (e: "select", preset: OfficialTemplate): void;
}>();

const iconError = ref(false);
</script>

<template>
  <div
    @click="$emit('select', preset)"
    class="flex flex-col border rounded-lg transition-all group overflow-hidden cursor-pointer select-none h-12"
    :class="
      loading
        ? 'bg-ide-accent/5 border-ide-accent/40 ring-1 ring-ide-accent/20 cursor-wait'
        : 'bg-ide-activity/30 border-ide-border hover:border-ide-accent/30'
    "
  >
    <div class="flex items-center justify-between p-3 flex-1">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <!-- Tech Icon -->
        <div
          class="w-7 h-7 shrink-0 flex items-center justify-center bg-ide-bg/40 rounded border border-ide-border/60 transition-all duration-300 shadow-inner"
        >
          <img
            v-if="preset.icon && !iconError"
            :src="`${URLS.SIMPLE_ICONS_BASE}/${preset.icon}`"
            class="w-4 h-4 opacity-80"
            @error="iconError = true"
            loading="lazy"
          />
          <svg
            v-else
            class="w-3.5 h-3.5 text-ide-text-muted/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>

        <div class="flex flex-col flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span
              class="text-[11px] font-black uppercase tracking-wider truncate"
              :class="loading ? 'text-ide-accent' : 'text-ide-text-bright'"
            >
              {{ preset.name }}
            </span>
            <span
              v-if="loading"
              class="w-2.5 h-2.5 border border-ide-accent border-t-transparent rounded-full animate-spin"
            ></span>
          </div>
          <span class="text-[8px] font-mono text-ide-text-muted truncate">{{
            preset.image
          }}</span>
        </div>
      </div>

      <!-- Action Indicator -->
      <div
        class="w-4 h-4 border border-ide-border rounded flex items-center justify-center transition-colors group-hover:border-ide-accent"
        :class="
          loading
            ? 'bg-ide-accent border-ide-accent shadow-[0_0_8px_rgba(var(--ide-accent-rgb),0.3)]'
            : 'bg-ide-sidebar-item'
        "
      >
        <svg
          class="w-3 h-3 transition-colors"
          :class="
            loading
              ? 'text-ide-bg'
              : 'text-ide-text-muted/30 group-hover:text-ide-accent'
          "
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </div>
    </div>
  </div>
</template>
