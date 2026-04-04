<script setup lang="ts">
import type { Section } from "../../types";
import IconPresets from "../ui/icons/IconPresets.vue";
import IconSettings from "../ui/icons/IconSettings.vue";
import IconFeatures from "../ui/icons/IconFeatures.vue";
import IconNetwork from "../ui/icons/IconNetwork.vue";
import IconMounts from "../ui/icons/IconMounts.vue";
import IconAdvanced from "../ui/icons/IconAdvanced.vue";

defineProps<{
  activeSection: Section;
}>();

defineEmits<{
  (e: "update:activeSection", section: Section): void;
}>();
</script>

<template>
  <aside
    class="w-12 bg-ide-activity border-r border-ide-border flex flex-col items-center py-4 gap-2 z-20"
  >
    <div
      @click="$emit('update:activeSection', 'presets')"
      class="activity-item group"
      :class="{ active: activeSection === 'presets' }"
      title="Presets (Quick Start)"
    >
      <IconPresets
        class="w-6 h-6 transition-colors duration-200"
        :class="
          activeSection === 'presets'
            ? 'text-ide-text-bright'
            : 'text-ide-text-muted group-hover:text-ide-text'
        "
        stroke-width="1.5"
      />
    </div>

    <div
      @click="$emit('update:activeSection', 'general')"
      class="activity-item group"
      :class="{ active: activeSection === 'general' }"
      title="General Settings"
    >
      <IconSettings
        class="w-6 h-6 transition-colors duration-200"
        :class="
          activeSection === 'general'
            ? 'text-ide-text-bright'
            : 'text-ide-text-muted group-hover:text-ide-text'
        "
        stroke-width="1.5"
      />
    </div>
    <div
      @click="$emit('update:activeSection', 'features')"
      class="activity-item group"
      :class="{ active: activeSection === 'features' }"
      title="Features"
    >
      <IconFeatures
        class="w-6 h-6 transition-colors duration-200"
        :class="
          activeSection === 'features'
            ? 'text-ide-text-bright'
            : 'text-ide-text-muted group-hover:text-ide-text'
        "
        stroke-width="1.5"
      />
    </div>
    <div
      @click="$emit('update:activeSection', 'ports')"
      class="activity-item group"
      :class="{ active: activeSection === 'ports' }"
      title="Network & Ports"
    >
      <IconNetwork
        class="w-6 h-6 transition-colors duration-200"
        :class="
          activeSection === 'ports'
            ? 'text-ide-text-bright'
            : 'text-ide-text-muted group-hover:text-ide-text'
        "
        stroke-width="1.5"
      />
    </div>
    <div
      @click="$emit('update:activeSection', 'mounts')"
      class="activity-item group"
      :class="{ active: activeSection === 'mounts' }"
      title="Mounts"
    >
      <IconMounts
        class="w-6 h-6 transition-colors duration-200"
        :class="
          activeSection === 'mounts'
            ? 'text-ide-text-bright'
            : 'text-ide-text-muted group-hover:text-ide-text'
        "
        stroke-width="1.5"
      />
    </div>
    <div
      @click="$emit('update:activeSection', 'advanced')"
      class="activity-item group"
      :class="{ active: activeSection === 'advanced' }"
      title="Advanced & Hooks"
    >
      <IconAdvanced
        class="w-6 h-6 transition-colors duration-200"
        :class="
          activeSection === 'advanced'
            ? 'text-ide-text-bright'
            : 'text-ide-text-muted group-hover:text-ide-text'
        "
        stroke-width="1.5"
      />
    </div>
  </aside>
</template>
