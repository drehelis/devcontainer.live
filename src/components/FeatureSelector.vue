<script setup lang="ts">
import { ref, computed } from "vue";
import { useFeatures } from "../composables/useFeatures";
import type { FeatureMetadata, FeatureOption } from "../types";
import SearchableSelect from "./SearchableSelect.vue";

const props = defineProps<{
  selectedFeatures: Record<string, any>;
}>();

const emit = defineEmits(["update:selectedFeatures"]);

const { features: featuresList, loading, error } = useFeatures();
const searchQuery = ref("");
const customFeatureId = ref("");
const filterType = ref<"all" | "official" | "community">("all");

const filteredFeatures = computed(() => {
  let list = featuresList.value;

  if (filterType.value !== "all") {
    const isOfficial = filterType.value === "official";
    list = list.filter(
      (f) => f.id.startsWith("ghcr.io/devcontainers/features") === isOfficial,
    );
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        (f.category && f.category.toLowerCase().includes(query)) ||
        (f.description && f.description.toLowerCase().includes(query)) ||
        f.id.toLowerCase().includes(query),
    );
  }

  return [...list].sort((a, b) => {
    const aOfficial = a.id.startsWith("ghcr.io/devcontainers/features");
    const bOfficial = b.id.startsWith("ghcr.io/devcontainers/features");
    if (aOfficial && !bOfficial) return -1;
    if (!aOfficial && bOfficial) return 1;
    return a.name.localeCompare(b.name);
  });
});

function toggleFeature(feature: FeatureMetadata) {
  const newFeatures = { ...props.selectedFeatures };
  if (newFeatures[feature.id]) {
    delete newFeatures[feature.id];
  } else {
    // Initialize with default options if available
    const defaults: Record<string, any> = {};
    if (feature.options) {
      Object.entries(feature.options).forEach(([key, opt]) => {
        const option = opt as FeatureOption;
        if (option.default !== undefined) defaults[key] = option.default;
      });
    }
    newFeatures[feature.id] = defaults;
  }
  emit("update:selectedFeatures", newFeatures);
}

function addCustomFeature() {
  if (!customFeatureId.value.trim()) return;
  const id = customFeatureId.value.trim();
  const newFeatures = { ...props.selectedFeatures };
  if (!newFeatures[id]) {
    newFeatures[id] = {};
    emit("update:selectedFeatures", newFeatures);
  }
  customFeatureId.value = "";
}

function updateFeatureOption(featureId: string, optionKey: string, value: any) {
  const newFeatures = { ...props.selectedFeatures };
  newFeatures[featureId] = { ...newFeatures[featureId], [optionKey]: value };
  emit("update:selectedFeatures", newFeatures);
}

const manualFeatures = computed(() => {
  return Object.keys(props.selectedFeatures).filter(
    (id) => !featuresList.value.some((f) => f.id === id),
  );
});
</script>

<template>
  <div class="space-y-6 flex flex-col h-full">
    <div
      class="flex gap-2 p-3 bg-ide-activity/20 border border-dashed border-ide-border rounded-lg group hover:border-ide-accent/30 transition-colors shrink-0"
    >
      <input
        v-model="customFeatureId"
        type="text"
        placeholder="MANUAL OCI ID (e.g. ghcr.io/user/repo/feature:1)"
        class="ide-input flex-1 text-[10px]"
        @keydown.enter="addCustomFeature"
      />
      <button
        @click="addCustomFeature"
        class="px-3 py-1 bg-ide-accent text-ide-bg text-[10px] font-black uppercase tracking-widest rounded hover:opacity-90 transition-opacity"
      >
        APPEND
      </button>
    </div>

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
        placeholder="SEARCH..."
        class="flex-1 bg-transparent border-none outline-none py-1 text-[11px] font-mono placeholder:text-ide-text-muted/40 h-auto"
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
      class="p-3 bg-ide-orange/10 border border-ide-orange/30 rounded text-ide-orange text-[10px] shrink-0"
    >
      Error fetching features: {{ error }}
    </div>

    <div
      class="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0 border-b border-ide-border/50 pb-4"
    >
      <button
        v-for="opt in [
          { value: 'all', label: 'All' },
          { value: 'official', label: 'Official' },
          { value: 'community', label: 'Community' },
        ]"
        :key="opt.value"
        @click="filterType = opt.value as 'all' | 'official' | 'community'"
        class="px-2 py-1 rounded border flex items-center justify-center text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap"
        :class="
          filterType === opt.value
            ? 'bg-ide-accent/20 border-ide-accent text-ide-accent ring-1 ring-ide-accent'
            : 'bg-ide-activity border-ide-border text-ide-text-muted hover:border-ide-text'
        "
      >
        {{ opt.label }}
      </button>
    </div>

    <div
      class="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 grid grid-cols-1 gap-3 min-h-0"
    >
      <div
        v-for="feature in filteredFeatures"
        :key="feature.id"
        class="flex flex-col border rounded-lg transition-all group relative focus-within:z-20"
        :class="
          selectedFeatures[feature.id]
            ? 'bg-ide-accent/5 border-ide-accent/40 ring-1 ring-ide-accent/20 z-10'
            : 'bg-ide-activity/30 border-ide-border hover:border-ide-accent/30 z-0'
        "
      >
        <div
          @click="toggleFeature(feature)"
          class="flex justify-between p-3 cursor-pointer select-none gap-3"
        >
          <div class="flex flex-col flex-1 min-w-0 gap-1.5">
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="text-[11px] font-black uppercase tracking-wider truncate flex-1 min-w-0"
                :title="feature.name"
                :class="
                  selectedFeatures[feature.id]
                    ? 'text-ide-accent'
                    : 'text-ide-text-bright'
                "
              >
                {{ feature.name }}
              </span>
              <span
                class="px-1.5 rounded-full text-[6px] font-black uppercase tracking-widest border whitespace-nowrap shrink-0"
                style="padding-top: 0.125rem; padding-bottom: 0.125rem"
                :class="
                  feature.id.startsWith('ghcr.io/devcontainers/features')
                    ? 'text-ide-accent/80 border-ide-accent/30 bg-ide-accent/5'
                    : 'text-[#a78bfa] border-[#a78bfa]/30 bg-[#a78bfa]/10'
                "
              >
                {{
                  feature.id.startsWith("ghcr.io/devcontainers/features")
                    ? "Official"
                    : "Community"
                }}
              </span>
              <a
                v-if="feature.documentationURL"
                :href="feature.documentationURL"
                target="_blank"
                @click.stop
                class="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity shrink-0 ml-1"
              >
                <svg
                  class="w-2.5 h-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
            <span
              class="text-[8px] font-mono text-ide-text-muted truncate block"
              :title="feature.id"
              >{{ feature.id }}</span
            >
          </div>
          <div
            class="w-4 h-4 border border-ide-border rounded flex items-center justify-center transition-colors"
            :class="
              selectedFeatures[feature.id]
                ? 'bg-ide-accent border-ide-accent'
                : 'bg-ide-sidebar-item'
            "
          >
            <svg
              v-if="selectedFeatures[feature.id]"
              class="w-3 h-3 text-ide-bg"
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
        </div>

        <div
          class="px-3 pb-3 border-t border-ide-accent/10 pt-2"
          v-if="selectedFeatures[feature.id] || searchQuery"
        >
          <p
            v-if="feature.description"
            class="text-[10px] text-ide-text-muted leading-relaxed mb-3"
          >
            {{ feature.description }}
          </p>

          <div class="flex flex-wrap items-center gap-2">
            <span
              class="px-1.5 py-0.5 rounded-sm bg-ide-bg text-[7px] font-black text-ide-text-muted/60 uppercase tracking-widest border border-ide-border"
            >
              {{ feature.category }}
            </span>
          </div>

          <div
            v-if="
              selectedFeatures[feature.id] &&
              feature.options &&
              Object.keys(feature.options).length > 0
            "
            class="mt-4 space-y-3 bg-ide-bg/30 p-2 rounded-lg border border-ide-border/50"
          >
            <div
              v-for="(opt, key) in feature.options"
              :key="key"
              class="space-y-1.5"
            >
              <div class="flex justify-between items-center">
                <span
                  class="text-[9px] font-mono text-ide-accent/80 uppercase tracking-tighter"
                  >{{ key }}</span
                >
                <span
                  v-if="opt.type === 'string' && (opt.proposals || opt.enum)"
                  class="text-[7px] opacity-40"
                  >Presets available</span
                >
              </div>

              <label
                v-if="opt.type === 'boolean'"
                class="flex items-center gap-2 cursor-pointer group/opt"
              >
                <input
                  type="checkbox"
                  :checked="selectedFeatures[feature.id][key] ?? opt.default"
                  @change="
                    updateFeatureOption(
                      feature.id,
                      key,
                      ($event.target as HTMLInputElement).checked,
                    )
                  "
                  class="hidden"
                />
                <div
                  class="w-3 h-3 border border-ide-border rounded-sm flex items-center justify-center transition-colors group-hover/opt:border-ide-accent"
                  :class="{
                    'bg-ide-accent border-ide-accent':
                      selectedFeatures[feature.id][key] ?? opt.default,
                  }"
                >
                  <svg
                    v-if="selectedFeatures[feature.id][key] ?? opt.default"
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
                <span class="text-[9px] text-ide-text-muted">{{
                  opt.description || "Enable"
                }}</span>
              </label>

              <div v-else class="space-y-1">
                <p
                  v-if="opt.description"
                  class="text-[8px] text-ide-text-muted/60"
                >
                  {{ opt.description }}
                </p>

                <SearchableSelect
                  v-if="opt.enum || opt.proposals"
                  :model-value="
                    String(selectedFeatures[feature.id][key] ?? opt.default)
                  "
                  :options="
                    (opt.enum || opt.proposals || []).map(
                      (val: string | number) => ({
                        value: String(val),
                        label: String(val),
                      }),
                    )
                  "
                  @update:model-value="
                    updateFeatureOption(feature.id, key, $event)
                  "
                  placeholder="Select option..."
                />

                <input
                  v-else
                  type="text"
                  :value="selectedFeatures[feature.id][key] ?? opt.default"
                  @input="
                    updateFeatureOption(
                      feature.id,
                      key,
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                  class="ide-input w-full py-1 text-[9px] font-mono bg-ide-bg/50 h-auto"
                  :placeholder="String(opt.default || '')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-for="id in manualFeatures"
        :key="id"
        class="flex flex-col border rounded-lg bg-ide-accent/5 border-ide-accent/40 ring-1 ring-ide-accent/20 relative focus-within:z-20"
      >
        <div class="flex items-center justify-between p-3">
          <div class="flex flex-col flex-1 min-w-0">
            <span
              class="text-[11px] font-black uppercase tracking-wider text-ide-accent"
              >Manual Reference</span
            >
            <span
              class="text-[8px] font-mono text-ide-text-muted truncate block pr-4"
              :title="String(id)"
              >{{ id }}</span
            >
          </div>
          <button
            @click="toggleFeature({ id: id as string, name: '' })"
            class="text-ide-text-muted hover:text-ide-orange transition-colors"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="px-3 pb-3 border-t border-ide-accent/10 pt-2">
          <div class="space-y-1.5">
            <label class="text-[8px] font-bold uppercase opacity-50"
              >Configuration JSON</label
            >
            <textarea
              placeholder='{"option": "value"}'
              :value="JSON.stringify(selectedFeatures[id])"
              @input="
                (e) => {
                  try {
                    const parsed = JSON.parse(
                      (e.target as HTMLTextAreaElement).value,
                    );
                    emit('update:selectedFeatures', {
                      ...selectedFeatures,
                      [id]: parsed,
                    });
                  } catch {}
                }
              "
              class="ide-input w-full font-mono text-[9px] bg-ide-bg/50 h-16 resize-none"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="filteredFeatures.length === 0 && !loading"
      class="py-12 text-center border border-dashed border-ide-border rounded-lg bg-ide-activity/10"
    >
      <p class="text-[10px] text-ide-text-muted">
        No features match your search.
      </p>
      <button
        @click="searchQuery = ''"
        class="mt-2 text-ide-accent text-[9px] font-bold uppercase hover:underline"
      >
        Clear Search
      </button>
    </div>
  </div>
</template>

<style scoped>
.select-none {
  user-select: none;
}
</style>
