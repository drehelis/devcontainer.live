<script setup lang="ts">
import { computed } from "vue";
import type { DevContainerConfig, OrchestrationType } from "../types";
import GeneralSection from "./GeneralSection.vue";
import FeaturesSection from "./FeaturesSection.vue";
import PortsSection from "./PortsSection.vue";
import MountsSection from "./MountsSection.vue";
import AdvancedSection from "./AdvancedSection.vue";

const props = defineProps<{
  modelValue: {
    orchestration: OrchestrationType;
    config: DevContainerConfig;
  };
  activeSection: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const config = computed(() => props.modelValue.config);
const orchestration = computed(() => props.modelValue.orchestration);

function handleUpdateConfig(newConfig: DevContainerConfig) {
  emit("update:modelValue", { ...props.modelValue, config: newConfig });
}

function handleUpdateOrchestration(val: OrchestrationType) {
  emit("update:modelValue", { ...props.modelValue, orchestration: val });
}
</script>

<template>
  <div class="space-y-8 font-sans pb-20">
    <div
      v-if="activeSection === 'general'"
      class="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300"
    >
      <GeneralSection
        :config="config"
        :orchestration="orchestration"
        @update:config="handleUpdateConfig"
        @update:orchestration="handleUpdateOrchestration"
      />
    </div>

    <div
      v-if="activeSection === 'features'"
      class="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300"
    >
      <FeaturesSection :config="config" @update:config="handleUpdateConfig" />
    </div>

    <div
      v-if="activeSection === 'ports'"
      class="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300"
    >
      <PortsSection
        :config="config"
        :orchestration="orchestration"
        @update:config="handleUpdateConfig"
      />
    </div>

    <div
      v-if="activeSection === 'mounts'"
      class="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300"
    >
      <MountsSection
        :config="config"
        :orchestration="orchestration"
        @update:config="handleUpdateConfig"
      />
    </div>

    <div
      v-if="activeSection === 'advanced'"
      class="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300"
    >
      <AdvancedSection
        :config="config"
        :orchestration="orchestration"
        @update:config="handleUpdateConfig"
      />
    </div>
  </div>
</template>
