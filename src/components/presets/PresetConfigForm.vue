<script setup lang="ts">
import { ref } from "vue";
import { URLS } from "../../constants/urls";
import type { OfficialTemplate, PresetConfigState } from "../../types";
import SearchableSelect from "../SearchableSelect.vue";

const props = defineProps<{
  template: OfficialTemplate;
  configuring: PresetConfigState;
}>();

const emit = defineEmits<{
  (e: "apply", data: PresetConfigState): void;
}>();

const iconError = ref(false);

const triggerApply = () => emit("apply", props.configuring);
</script>

<template>
  <div
    class="mt-2 ml-4 p-4 rounded-lg bg-ide-activity/20 border border-ide-accent/20 animate-in slide-in-from-top-2 duration-300 space-y-4"
  >
    <div class="flex items-center gap-4 pb-4 border-b border-ide-accent/10">
      <div
        class="w-12 h-12 shrink-0 flex items-center justify-center bg-ide-bg rounded-lg border border-ide-accent/20 shadow-xl shadow-ide-accent/5"
      >
        <img
          v-if="template.icon && !iconError"
          :src="`${URLS.SIMPLE_ICONS_BASE}/${template.icon}`"
          class="w-7 h-7"
          @error="iconError = true"
          :alt="template.name"
        />
        <svg
          v-else
          class="w-6 h-6 text-ide-text-muted/20"
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
      <div>
        <h3
          class="text-[12px] font-black text-ide-text-bright uppercase tracking-tighter line-clamp-1"
        >
          CONFIGURE STACK
        </h3>
        <p
          class="text-[9px] text-ide-text-muted font-mono uppercase opacity-60 line-clamp-1"
        >
          {{ template.name }} • {{ configuring.metadata?.version || "LATEST" }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="(opt, key) in configuring.metadata.options"
        :key="key"
        class="space-y-2"
      >
        <div class="flex items-center justify-between">
          <span
            class="text-[9px] font-mono text-ide-accent/80 uppercase tracking-tighter"
            >{{ key }}</span
          >
          <span class="text-[7px] text-ide-text-muted/40 uppercase">{{
            opt.type
          }}</span>
        </div>

        <p
          v-if="opt.description"
          class="text-[8px] text-ide-text-muted leading-relaxed"
        >
          {{ opt.description }}
        </p>

        <!-- Boolean -->
        <label
          v-if="opt.type === 'boolean'"
          class="flex items-center gap-2 cursor-pointer group/opt"
        >
          <input
            type="checkbox"
            :checked="configuring.userValues[key] === 'true'"
            @change="
              configuring.userValues[key] = ($event.target as HTMLInputElement)
                .checked
                ? 'true'
                : 'false'
            "
            class="hidden"
          />
          <div
            class="w-3 h-3 border border-ide-border rounded-sm flex items-center justify-center transition-colors group-hover/opt:border-ide-accent"
            :class="{
              'bg-ide-accent border-ide-accent':
                configuring.userValues[key] === 'true',
            }"
          >
            <svg
              v-if="configuring.userValues[key] === 'true'"
              class="w-2.5 h-2.5 text-ide-bg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="4"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span class="text-[9px] text-ide-text-muted">Enable</span>
        </label>

        <!-- Enum/Select -->
        <SearchableSelect
          v-else-if="opt.enum || opt.proposals"
          v-model="configuring.userValues[key]"
          :options="
            (opt.enum || opt.proposals || []).map((val: string | number) => ({
              value: String(val),
              label: String(val),
            }))
          "
          class="w-full"
        />

        <!-- Input -->
        <input
          v-else
          v-model="configuring.userValues[key]"
          type="text"
          class="ide-input w-full py-1 text-[9px] h-auto font-mono bg-ide-bg/80"
          :placeholder="String(opt.default || '')"
        />
      </div>
    </div>

    <button
      @click="triggerApply"
      class="w-full py-2 bg-ide-accent text-ide-bg rounded text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
    >
      <span>BUILD CONFIGURATION</span>
      <svg
        class="w-3.5 h-3.5"
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
    </button>
  </div>
</template>
