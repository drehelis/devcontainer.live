<script setup lang="ts">
import type { DevContainerConfig, OrchestrationType } from "../types";
import SectionHeader from "./SectionHeader.vue";
import InfoTooltip from "./InfoTooltip.vue";
import ImageSourceField from "./config/sections/General/ImageSourceField.vue";
import DockerfileSettings from "./config/sections/General/DockerfileSettings.vue";
import DockerComposeSettings from "./config/sections/General/DockerComposeSettings.vue";
import IdentitySettings from "./config/sections/General/IdentitySettings.vue";
import RuntimeSettings from "./config/sections/General/RuntimeSettings.vue";

const props = defineProps<{
  config: DevContainerConfig;
  orchestration: OrchestrationType;
}>();

const emit = defineEmits<{
  (e: "update:config", value: DevContainerConfig): void;
  (e: "update:orchestration", value: OrchestrationType): void;
}>();

function updateConfig(newConfig: DevContainerConfig) {
  emit("update:config", newConfig);
}

function updateOrchestration(val: OrchestrationType) {
  emit("update:orchestration", val);
}

const orchestrationOptions: { value: OrchestrationType; label: string }[] = [
  { value: "image", label: "Image" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "dockerCompose", label: "Docker Compose" },
];
</script>

<template>
  <div class="space-y-8">
    <SectionHeader title="Core Identifier" />
    <div class="space-y-4">
      <div class="flex items-center gap-1.5">
        <label
          class="text-[9px] font-black uppercase tracking-widest text-ide-text-muted"
          >Display Name</label
        >
        <InfoTooltip property="name" />
      </div>
      <input
        :value="config.name"
        @input="
          updateConfig({
            ...config,
            name: ($event.target as HTMLInputElement).value,
          })
        "
        type="text"
        class="ide-input w-full font-mono text-sm"
        placeholder="devcontainer.live"
      />
    </div>

    <SectionHeader title="Orchestration Type" />
    <div class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          v-for="opt in orchestrationOptions"
          :key="opt.value"
          @click="updateOrchestration(opt.value)"
          class="px-2 py-3 rounded border text-[10px] font-black uppercase tracking-wider transition-all"
          :class="
            orchestration === opt.value
              ? 'bg-ide-accent/20 border-ide-accent text-ide-accent ring-1 ring-ide-accent'
              : 'bg-ide-activity border-ide-border text-ide-text-muted hover:border-ide-text'
          "
        >
          {{ opt.label }}
        </button>
      </div>

      <ImageSourceField
        v-if="orchestration === 'image'"
        :image="config.image"
        @update:image="updateConfig({ ...config, image: $event })"
      />

      <DockerfileSettings
        v-if="orchestration === 'dockerfile'"
        :build="config.build"
        @update:build="updateConfig({ ...config, build: $event })"
      />

      <DockerComposeSettings
        v-if="orchestration === 'dockerCompose'"
        :config="config"
        @update:config="updateConfig"
      />
    </div>

    <div v-if="orchestration !== 'dockerCompose'" class="space-y-8">
      <IdentitySettings :config="config" @update:config="updateConfig" />

      <RuntimeSettings :config="config" @update:config="updateConfig" />
    </div>
  </div>
</template>
