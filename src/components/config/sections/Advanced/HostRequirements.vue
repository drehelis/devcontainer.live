<script setup lang="ts">
import type { DevContainerConfig } from "../../../../types";
import SectionHeader from "../../../SectionHeader.vue";
import InfoTooltip from "../../../InfoTooltip.vue";
import SearchableSelect from "../../../SearchableSelect.vue";
import NumericStepper from "../../../NumericStepper.vue";

const props = defineProps<{
  config: DevContainerConfig;
}>();

const emit = defineEmits<{
  (e: "update:config", val: DevContainerConfig): void;
}>();

const UNIT_OPTIONS = [
  { value: "tb", label: "TB" },
  { value: "gb", label: "GB" },
  { value: "mb", label: "MB" },
  { value: "kb", label: "KB" },
];

function updateConfig(path: string, value: any) {
  const newConfig = { ...props.config };
  if (path.startsWith("hostRequirements.")) {
    const key = path.split(".")[1];
    newConfig.hostRequirements = {
      ...(newConfig.hostRequirements || {}),
      [key]: value,
    };
  } else {
    (newConfig as any)[path] = value;
  }
  emit("update:config", newConfig);
}

function parseSize(val: string | undefined) {
  if (!val) return { num: "", unit: "gb" };
  const matches = val.match(/^(\d+(?:\.\d+)?)\s*(tb|gb|mb|kb)?$/i);
  if (!matches) return { num: val, unit: "gb" };
  return { num: matches[1], unit: (matches[2] || "gb").toLowerCase() };
}

function updateSize(
  key: "memory" | "storage" | "gpu.memory",
  num: string,
  unit: string,
) {
  if (key === "gpu.memory") {
    const gpu = { ...((props.config.hostRequirements?.gpu as object) || {}) };
    (gpu as any).memory = `${num}${unit}`;
    updateConfig("hostRequirements.gpu", gpu);
  } else {
    updateConfig(`hostRequirements.${key}`, `${num}${unit}`);
  }
}
</script>

<template>
  <div class="space-y-6 pt-8 border-t border-ide-border">
    <SectionHeader title="Host Requirements" />
    <div class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="space-y-2">
          <div class="flex items-center gap-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-ide-text-muted italic"
              >CPUs</label
            >
            <InfoTooltip property="hostRequirements.cpus" />
          </div>
          <NumericStepper
            :model-value="config.hostRequirements?.cpus"
            @update:model-value="updateConfig('hostRequirements.cpus', $event)"
            placeholder="2"
          />
        </div>
        <div class="space-y-2">
          <div class="flex items-center gap-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-ide-text-muted italic"
              >Memory</label
            >
            <InfoTooltip property="hostRequirements.memory" />
          </div>
          <div class="flex">
            <NumericStepper
              :model-value="parseSize(config.hostRequirements?.memory).num"
              @update:model-value="
                (val) =>
                  updateSize(
                    'memory',
                    val.toString(),
                    parseSize(config.hostRequirements?.memory).unit,
                  )
              "
              class="flex-1 !rounded-r-none [&_input]:!rounded-r-none [&_input]:border-r-0"
              placeholder="4"
            />
            <SearchableSelect
              :model-value="parseSize(config.hostRequirements?.memory).unit"
              :options="UNIT_OPTIONS"
              @update:model-value="
                (val) =>
                  updateSize(
                    'memory',
                    parseSize(config.hostRequirements?.memory).num,
                    val,
                  )
              "
              class="w-14 !rounded-l-none"
            />
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex items-center gap-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-ide-text-muted italic"
              >Storage</label
            >
            <InfoTooltip property="hostRequirements.storage" />
          </div>
          <div class="flex">
            <NumericStepper
              :model-value="parseSize(config.hostRequirements?.storage).num"
              @update:model-value="
                (val) =>
                  updateSize(
                    'storage',
                    val.toString(),
                    parseSize(config.hostRequirements?.storage).unit,
                  )
              "
              class="flex-1 !rounded-r-none [&_input]:!rounded-r-none [&_input]:border-r-0"
              placeholder="32"
            />
            <SearchableSelect
              :model-value="parseSize(config.hostRequirements?.storage).unit"
              :options="UNIT_OPTIONS"
              @update:model-value="
                (val) =>
                  updateSize(
                    'storage',
                    parseSize(config.hostRequirements?.storage).num,
                    val,
                  )
              "
              class="w-14 !rounded-l-none"
            />
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <label
          class="flex items-center gap-3 p-3 bg-ide-activity/50 border border-ide-border rounded-lg cursor-pointer group hover:border-ide-accent/50 transition-colors"
        >
          <input
            type="checkbox"
            :checked="!!config.hostRequirements?.gpu"
            @change="
              updateConfig(
                'hostRequirements.gpu',
                ($event.target as HTMLInputElement).checked
                  ? 'optional'
                  : undefined,
              )
            "
            class="hidden"
          />
          <div
            class="w-4 h-4 border-2 border-ide-border rounded flex items-center justify-center group-hover:border-ide-accent transition-colors"
            :class="{
              'bg-ide-accent border-ide-accent': config.hostRequirements?.gpu,
            }"
          >
            <svg
              v-if="config.hostRequirements?.gpu"
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
          <div class="flex flex-col">
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-black uppercase tracking-widest"
                >Enable GPU</span
              >
              <InfoTooltip property="hostRequirements.gpu" />
            </div>
            <span class="text-[8px] text-ide-text-muted italic"
              >Hardware acceleration</span
            >
          </div>
        </label>

        <div
          v-if="config.hostRequirements?.gpu"
          class="pl-7 space-y-3 border-l border-ide-border animate-in fade-in duration-300"
        >
          <div class="flex items-center gap-4">
            <label class="text-[8px] font-bold uppercase opacity-50"
              >Constraint Type</label
            >
            <div class="flex gap-2">
              <button
                @click="updateConfig('hostRequirements.gpu', 'optional')"
                class="text-[7px] px-2 py-0.5 border border-ide-border rounded-sm uppercase tracking-widest transition-colors"
                :class="
                  config.hostRequirements?.gpu === 'optional'
                    ? 'bg-ide-accent text-ide-bg border-ide-accent'
                    : 'hover:border-white'
                "
              >
                Optional
              </button>
              <button
                @click="updateConfig('hostRequirements.gpu', true)"
                class="text-[7px] px-2 py-0.5 border border-ide-border rounded-sm uppercase tracking-widest transition-colors"
                :class="
                  config.hostRequirements?.gpu === true
                    ? 'bg-ide-accent text-ide-bg border-ide-accent'
                    : 'hover:border-white'
                "
              >
                Required
              </button>
              <button
                @click="updateConfig('hostRequirements.gpu', {})"
                class="text-[7px] px-2 py-0.5 border border-ide-border rounded-sm uppercase tracking-widest transition-colors"
                :class="
                  typeof config.hostRequirements?.gpu === 'object'
                    ? 'bg-ide-accent text-ide-bg border-ide-accent'
                    : 'hover:border-white'
                "
              >
                Detailed
              </button>
            </div>
          </div>

          <div
            v-if="typeof config.hostRequirements?.gpu === 'object'"
            class="grid grid-cols-2 gap-3"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-1.5">
                <label class="text-[8px] font-bold uppercase opacity-50"
                  >Core Count</label
                >
                <InfoTooltip property="hostRequirements.gpu.cores" />
              </div>
              <NumericStepper
                :model-value="(config.hostRequirements.gpu as any).cores"
                @update:model-value="
                  (val) => {
                    const gpu = {
                      ...((config.hostRequirements?.gpu as object) || {}),
                    };
                    (gpu as any).cores = Number(val);
                    updateConfig('hostRequirements.gpu', gpu);
                  }
                "
                placeholder="1"
              />
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-1.5">
                <label class="text-[8px] font-bold uppercase opacity-50"
                  >VRAM</label
                >
                <InfoTooltip property="hostRequirements.gpu.memory" />
              </div>
              <div class="flex">
                <NumericStepper
                  :model-value="
                    parseSize((config.hostRequirements?.gpu as any).memory).num
                  "
                  @update:model-value="
                    (val) =>
                      updateSize(
                        'gpu.memory',
                        val.toString(),
                        parseSize((config.hostRequirements?.gpu as any).memory)
                          .unit,
                      )
                  "
                  class="flex-1 !rounded-r-none [&_input]:!rounded-r-none [&_input]:border-r-0"
                  placeholder="4"
                />
                <SearchableSelect
                  :model-value="
                    parseSize((config.hostRequirements?.gpu as any).memory).unit
                  "
                  :options="UNIT_OPTIONS"
                  @update:model-value="
                    (val) =>
                      updateSize(
                        'gpu.memory',
                        parseSize((config.hostRequirements?.gpu as any).memory)
                          .num,
                        val,
                      )
                  "
                  class="w-14 !rounded-l-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
