<script setup lang="ts">
import { ref, computed } from "vue";
import type {
  OrchestrationType,
  OfficialTemplate,
  PresetConfigState,
  TemplateOption,
  PresetApplyPayload,
} from "../../types";
import {
  usePresets,
  substituteTemplateOptions,
} from "../../composables/usePresets";
import PresetCard from "./PresetCard.vue";
import PresetConfigForm from "./PresetConfigForm.vue";
import SectionHeader from "../SectionHeader.vue";

const emit = defineEmits<{
  (e: "apply", data: PresetApplyPayload): void;
}>();

const { templates, loading, error, refresh, fetchTemplateConfig } =
  usePresets();
const searchQuery = ref("");
const loadingTemplate = ref<string | null>(null);

const configuring = ref<PresetConfigState | null>(null);

const filteredTemplates = computed(() => {
  if (!searchQuery.value) return templates.value;
  const query = searchQuery.value.toLowerCase();
  return templates.value.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query),
  );
});

async function handleSelect(template: OfficialTemplate) {
  if (configuring.value?.metadata?.id === template.id) {
    configuring.value = null;
    return;
  }

  loadingTemplate.value = template.id;
  try {
    const { config, metadata, dockerfile, dockerCompose } =
      await fetchTemplateConfig(template.id);

    if (metadata?.options && Object.keys(metadata.options).length > 0) {
      const userValues: Record<string, string> = {};
      Object.entries(metadata.options).forEach(([key, opt]) => {
        const o = opt as TemplateOption;
        userValues[key] = String(userValues[key] ?? o.default ?? "");
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

function handleApply(data: PresetConfigState) {
  apply(
    data.config,
    data.metadata,
    data.userValues,
    data.dockerfile,
    data.dockerCompose,
  );
}

function apply(
  config: any,
  metadata: any,
  userValues: Record<string, string>,
  dockerfile: string | null = null,
  dockerCompose: string | null = null,
) {
  const finalConfig = substituteTemplateOptions(config, metadata, userValues);

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
  <div
    class="space-y-4 flex flex-col h-full animate-in fade-in slide-in-from-left-2 duration-300"
  >
    <SectionHeader
      title="Templates"
      tooltip="Official Dev Container templates from ghcr.io."
    />

    <div class="space-y-3 flex flex-col flex-1 min-h-0">
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

      <div
        v-if="error"
        class="px-3 py-2 bg-ide-orange/10 border border-ide-orange/30 rounded flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1"
      >
        <p class="text-[9px] text-ide-orange leading-none truncate">
          {{ error }}
        </p>
        <button
          @click="refresh"
          class="shrink-0 text-[8px] font-black uppercase tracking-widest text-ide-orange hover:underline"
          :disabled="loading"
        >
          Retry
        </button>
      </div>

      <div
        v-if="filteredTemplates.length > 0"
        class="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 flex flex-col gap-2 min-h-0"
      >
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="flex flex-col"
        >
          <PresetCard
            :preset="template"
            :loading="loadingTemplate === template.id"
            @select="handleSelect"
            :class="{
              'bg-ide-accent/5 border-ide-accent/40 ring-1 ring-ide-accent/20 shadow-[0_0_12px_rgba(var(--ide-accent-rgb),0.05)]':
                configuring?.metadata?.id === template.id,
            }"
          />

          <PresetConfigForm
            v-if="configuring?.metadata?.id === template.id"
            :template="template"
            :configuring="configuring"
            @apply="handleApply"
          />
        </div>
      </div>

      <div
        v-else-if="!loading && !error"
        class="py-12 text-center border border-dashed border-ide-border rounded-lg bg-ide-activity/10"
      >
        <p class="text-[10px] text-ide-text-muted">
          No templates match search.
        </p>
        <button
          @click="searchQuery = ''"
          class="mt-2 text-ide-accent text-[9px] font-bold uppercase hover:underline"
        >
          Clear Filter
        </button>
      </div>
    </div>
  </div>
</template>
