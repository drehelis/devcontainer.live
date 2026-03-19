<script setup lang="ts">
import { ref, computed } from "vue";
import type { OrchestrationType } from "../../types";
import { usePresets, substituteTemplateOptions } from "../../composables/usePresets";
import PresetCard from "./PresetCard.vue";
import SectionHeader from "../SectionHeader.vue";
import SearchableSelect from "../SearchableSelect.vue";

const emit = defineEmits<{
  (e: "apply", config: any): void;
}>();

const { templates, loading, error, fetchTemplateConfig } = usePresets();
const searchQuery = ref("");
const loadingTemplate = ref<string | null>(null);

// State for the template being configured
const configuring = ref<{
  config: any;
  metadata: any;
  userValues: Record<string, string>;
  dockerfile: string | null;
  dockerCompose: string | null;
} | null>(null);

const filteredTemplates = computed(() => {
  if (!searchQuery.value) return templates.value;
  const query = searchQuery.value.toLowerCase();
  return templates.value.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query),
  );
});

async function handleSelect(template: any) {
  if (configuring.value?.metadata?.id === template.id) {
    configuring.value = null;
    return;
  }

  loadingTemplate.value = template.id;
  try {
    const { config, metadata, dockerfile, dockerCompose } = await fetchTemplateConfig(template.id);
    
    // If there are options, we show the configuration form
    if (metadata?.options && Object.keys(metadata.options).length > 0) {
      const userValues: Record<string, string> = {};
      Object.entries(metadata.options).forEach(([key, opt]: [string, any]) => {
        userValues[key] = String(userValues[key] ?? opt.default ?? "");
      });

      configuring.value = {
        config,
        metadata,
        userValues,
        dockerfile,
        dockerCompose,
      };
    } else {
      apply(config, metadata, {}, dockerfile, dockerCompose);
    }
  } catch (e) {
    apply({ name: template.name, image: template.image }, null, {});
  } finally {
    loadingTemplate.value = null;
  }
}

function apply(config: any, metadata: any, userValues: Record<string, string>, dockerfile: string | null = null, dockerCompose: string | null = null) {
  const finalConfig = substituteTemplateOptions(config, metadata, userValues);
  
  // Detect orchestration from the imported config
  let orchestration: OrchestrationType = "image";
  if (finalConfig.dockerComposeFile) {
    orchestration = "dockerCompose";
  } else if (finalConfig.build || finalConfig.dockerFile) {
    orchestration = "dockerfile";
  }

  emit("apply", {
    orchestration,
    config: {
      ...finalConfig,
      name: metadata?.name || finalConfig.name || "devcontainer.live",
    },
    dockerfile,
    dockerCompose,
  });
  configuring.value = null;
}
</script>

<template>
  <div class="space-y-4 flex flex-col h-full animate-in fade-in slide-in-from-left-2 duration-300">
    <SectionHeader
      title="Templates"
      tooltip="Official Dev Container templates from ghcr.io."
    />

    <div class="space-y-3 flex flex-col flex-1 min-h-0">
      <!-- Search & Loading -->
      <div
        class="ide-input flex items-center gap-3 px-3 focus-within:border-ide-accent focus-within:ring-1 focus-within:ring-ide-accent/20 transition-all shrink-0"
      >
        <svg
          class="w-4 h-4 text-ide-text-muted shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="SEARCH OFFICIAL TEMPLATES..."
          class="flex-1 bg-transparent border-none outline-none py-1 text-[11px] font-mono placeholder:text-ide-text-muted/40 uppercase h-auto"
          :disabled="loading"
        />
        <div v-if="loading" class="shrink-0">
          <div
            class="w-3.5 h-3.5 border-2 border-ide-accent border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
      </div>

      <!-- Templates List -->
      <div
        v-if="!error"
        class="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 flex flex-col gap-2 min-h-0"
      >
      <div v-for="template in filteredTemplates" :key="template.id" class="flex flex-col">
        <PresetCard
          :preset="template"
          :loading="loadingTemplate === template.id"
          @select="handleSelect"
          :class="{
            'bg-ide-accent/5 border-ide-accent/40 ring-1 ring-ide-accent/20 shadow-[0_0_12px_rgba(var(--ide-accent-rgb),0.05)]': configuring?.metadata?.id === template.id
          }"
        />

        <!-- Inline Config Step (Matching Feature Selector Style) -->
        <div
          v-if="configuring?.metadata?.id === template.id"
          class="mt-2 ml-4 p-4 rounded-lg bg-ide-activity/20 border border-ide-accent/20 animate-in slide-in-from-top-2 duration-300 space-y-4"
        >
          <div class="grid grid-cols-1 gap-4">
            <div v-for="(opt, key) in configuring.metadata.options" :key="key" class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-mono text-ide-accent/80 uppercase tracking-tighter">{{ key }}</span>
                <span class="text-[7px] text-ide-text-muted/40 italic uppercase">{{ opt.type }}</span>
              </div>
              
              <p v-if="opt.description" class="text-[8px] text-ide-text-muted italic leading-relaxed">
                {{ opt.description }}
              </p>

              <!-- Boolean Option -->
              <label
                v-if="opt.type === 'boolean'"
                class="flex items-center gap-2 cursor-pointer group/opt"
              >
                <input
                  type="checkbox"
                  :checked="configuring.userValues[key] === 'true'"
                  @change="configuring.userValues[key] = ($event.target as HTMLInputElement).checked ? 'true' : 'false'"
                  class="hidden"
                />
                <div
                  class="w-3 h-3 border border-ide-border rounded-sm flex items-center justify-center transition-colors group-hover/opt:border-ide-accent"
                  :class="{
                    'bg-ide-accent border-ide-accent': configuring.userValues[key] === 'true',
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

              <!-- Select if enum/proposals -->
              <SearchableSelect
                v-else-if="opt.enum || opt.proposals"
                v-model="configuring.userValues[key]"
                :options="(opt.enum || opt.proposals).map((val: string) => ({ value: String(val), label: String(val) }))"
                class="w-full"
              />

              <!-- Default Input -->
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
            @click="apply(configuring.config, configuring.metadata, configuring.userValues, configuring.dockerfile, configuring.dockerCompose)"
            class="w-full py-2 bg-ide-accent text-ide-bg rounded text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
          >
            <span>BUILD CONFIGURATION</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        v-if="filteredTemplates.length === 0 && !loading"
        class="py-12 text-center border border-dashed border-ide-border rounded-lg bg-ide-activity/10"
      >
        <p class="text-[10px] italic text-ide-text-muted">No templates match search.</p>
        <button
          @click="searchQuery = ''"
          class="mt-2 text-ide-accent text-[9px] font-bold uppercase hover:underline"
        >
          Clear Filter
        </button>
      </div>
    </div>

      <div
        v-else
        class="p-4 bg-ide-orange/10 border border-ide-orange/30 rounded text-ide-orange text-[10px] italic"
      >
        Error loading templates: {{ error }}
      </div>
    </div>
  </div>
</template>
