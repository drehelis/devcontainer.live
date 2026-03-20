<script setup lang="ts">
import type { DevContainerConfig } from "../../../../types";
import SectionHeader from "../../../SectionHeader.vue";
import SearchableSelect from "../../../SearchableSelect.vue";
import InfoTooltip from "../../../InfoTooltip.vue";

const props = defineProps<{
  config: DevContainerConfig;
}>();

const emit = defineEmits<{
  (e: "update:config", val: DevContainerConfig): void;
}>();

const userEnvProbeOptions = [
  { value: "none", label: "None" },
  { value: "loginShell", label: "Login Shell" },
  { value: "interactiveShell", label: "Interactive Shell" },
  { value: "loginInteractiveShell", label: "Login Interactive Shell" },
];

function updateConfig(path: string, value: any) {
  emit("update:config", { ...props.config, [path]: value });
}
</script>

<template>
  <div class="space-y-4">
    <SectionHeader title="Identity Config" />
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <div class="flex items-center gap-1.5">
          <label
            class="text-[9px] font-black uppercase tracking-widest text-ide-text-muted"
            >Remote User</label
          >
          <InfoTooltip property="remoteUser" />
        </div>
        <input
          :value="config.remoteUser"
          @input="
            updateConfig(
              'remoteUser',
              ($event.target as HTMLInputElement).value,
            )
          "
          type="text"
          class="ide-input w-full"
          placeholder="vscode"
        />
      </div>
      <div class="space-y-2">
        <div class="flex items-center gap-1.5">
          <label
            class="text-[9px] font-black uppercase tracking-widest text-ide-text-muted"
            >Container User</label
          >
          <InfoTooltip property="containerUser" />
        </div>
        <input
          :value="config.containerUser"
          @input="
            updateConfig(
              'containerUser',
              ($event.target as HTMLInputElement).value,
            )
          "
          type="text"
          class="ide-input w-full"
          placeholder="root"
        />
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex items-center gap-1.5">
        <label
          class="text-[9px] font-black uppercase tracking-widest text-ide-text-muted"
          >User Env Probe</label
        >
        <InfoTooltip property="userEnvProbe" />
      </div>
      <SearchableSelect
        :model-value="config.userEnvProbe || 'none'"
        :options="userEnvProbeOptions"
        @update:model-value="updateConfig('userEnvProbe', $event)"
        placeholder="Select Probe..."
      />
    </div>

    <label
      class="flex items-center gap-3 p-3 bg-ide-activity/50 border border-ide-border rounded-lg cursor-pointer group hover:border-ide-accent/50 transition-colors"
    >
      <input
        type="checkbox"
        :checked="config.updateRemoteUserUID"
        @change="
          updateConfig(
            'updateRemoteUserUID',
            ($event.target as HTMLInputElement).checked,
          )
        "
        class="hidden"
      />
      <div
        class="w-4 h-4 border-2 border-ide-border rounded flex items-center justify-center group-hover:border-ide-accent transition-colors"
        :class="{
          'bg-ide-accent border-ide-accent': config.updateRemoteUserUID,
        }"
      >
        <svg
          v-if="config.updateRemoteUserUID"
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
            >Update UID</span
          >
          <InfoTooltip property="updateRemoteUserUID" />
        </div>
        <span class="text-[8px] text-ide-text-muted"
          >Sync local/remote UID</span
        >
      </div>
    </label>
  </div>
</template>
