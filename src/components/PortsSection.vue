<script setup lang="ts">
import { computed } from "vue";
import type { DevContainerConfig, OrchestrationType } from "../types";
import SectionHeader from "./SectionHeader.vue";
import PortControl from "./PortControl.vue";
import SearchableSelect from "./SearchableSelect.vue";
import InfoTooltip from "./InfoTooltip.vue";

const props = defineProps<{
  config: DevContainerConfig;
  orchestration: OrchestrationType;
}>();

const emit = defineEmits<{
  (e: "update:config", value: DevContainerConfig): void;
}>();

function updateConfig(path: string, value: any) {
  const newConfig = { ...props.config };

  if (path.startsWith("otherPortsAttributes.")) {
    const key = path.split(".")[1];
    newConfig.otherPortsAttributes = {
      ...(newConfig.otherPortsAttributes || {}),
      [key]: value,
    };
  } else {
    (newConfig as any)[path] = value;
  }

  emit("update:config", newConfig);
}

function removeItem(path: string, index: number) {
  let list: any[] = [];
  const currentVal = (props.config as any)[path];

  if (path === "appPort") {
    list = Array.isArray(currentVal)
      ? [...currentVal]
      : currentVal
        ? [currentVal]
        : [];
  } else {
    list = [...(currentVal || [])];
  }

  list.splice(index, 1);
  updateConfig(path, list);
}

const onAutoForwardOptions = [
  { value: "notify", label: "Notify" },
  { value: "openBrowser", label: "Open Browser" },
  { value: "openPreview", label: "Open Preview" },
  { value: "silent", label: "Silent" },
  { value: "ignore", label: "Ignore" },
];

const isHostNetworkEnabled = computed(() => {
  return props.config.runArgs?.includes("--network=host") || false;
});

const isHostGatewayEnabled = computed(() => {
  const flag = "--add-host=host.docker.internal:host-gateway";
  if (props.orchestration === "image") {
    return props.config.runArgs?.includes(flag) || false;
  }
  if (props.orchestration === "dockerfile") {
    return props.config.build?.options?.includes(flag) || false;
  }
  return false;
});

function toggleHostNetwork() {
  const currentArgs = [...(props.config.runArgs || [])];
  const flag = "--network=host";

  if (currentArgs.includes(flag)) {
    const updated = currentArgs.filter((arg) => arg !== flag);
    updateConfig("runArgs", updated.length > 0 ? updated : undefined);
  } else {
    updateConfig("runArgs", [...currentArgs, flag]);
  }
}

function toggleHostGateway() {
  const flag = "--add-host=host.docker.internal:host-gateway";
  const newConfig = { ...props.config };

  if (props.orchestration === "image") {
    const current = [...(newConfig.runArgs || [])];
    if (current.includes(flag)) {
      newConfig.runArgs = current.filter((a) => a !== flag);
      if (newConfig.runArgs.length === 0) delete newConfig.runArgs;
    } else {
      newConfig.runArgs = [...current, flag];
    }
  } else if (props.orchestration === "dockerfile") {
    const build = { ...(newConfig.build || {}) };
    const options = [...(build.options || [])];
    if (options.includes(flag)) {
      build.options = options.filter((a) => a !== flag);
      if (build.options.length === 0) delete build.options;
    } else {
      build.options = [...options, flag];
    }

    if (Object.keys(build).length === 0) {
      delete newConfig.build;
    } else {
      newConfig.build = build;
    }
  }

  emit("update:config", newConfig);
}
</script>

<template>
  <div class="space-y-6">
    <SectionHeader title="Network Matrix" tooltip="forwardPorts" class="mb-4" />
    <PortControl
      :ports="config.forwardPorts || []"
      :attributes="config.portsAttributes || {}"
      @update:ports="updateConfig('forwardPorts', $event)"
      @update:attributes="updateConfig('portsAttributes', $event)"
    />

    <div class="space-y-4 pt-4 border-t border-ide-border">
      <SectionHeader title="Network Config" />
      <div class="space-y-3">
        <label
          class="flex items-center gap-3 p-3 bg-ide-activity/50 border border-ide-border rounded-lg cursor-pointer group hover:border-ide-accent/50 transition-colors"
        >
          <input
            type="checkbox"
            :checked="isHostNetworkEnabled"
            @change="toggleHostNetwork"
            class="hidden"
          />
          <div
            class="w-4 h-4 border-2 border-ide-border rounded flex items-center justify-center group-hover:border-ide-accent transition-colors"
            :class="{ 'bg-ide-accent border-ide-accent': isHostNetworkEnabled }"
          >
            <svg
              v-if="isHostNetworkEnabled"
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
                >Host Networking</span
              >
            </div>
            <span class="text-[8px] text-ide-text-muted"
              >Use the host's network stack directly (--network=host)</span
            >
          </div>
        </label>

        <label
          v-if="orchestration !== 'dockerCompose'"
          class="flex items-center gap-3 p-3 bg-ide-activity/50 border border-ide-border rounded-lg cursor-pointer group hover:border-ide-accent/50 transition-colors"
        >
          <input
            type="checkbox"
            :checked="isHostGatewayEnabled"
            @change="toggleHostGateway"
            class="hidden"
          />
          <div
            class="w-4 h-4 border-2 border-ide-border rounded flex items-center justify-center group-hover:border-ide-accent transition-colors"
            :class="{ 'bg-ide-accent border-ide-accent': isHostGatewayEnabled }"
          >
            <svg
              v-if="isHostGatewayEnabled"
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
                >Resolve host's gateway IP</span
              >
            </div>
            <span class="text-[8px] text-ide-text-muted"
              >Access services on host via host.docker.internal</span
            >
          </div>
        </label>

        <div class="space-y-2">
          <div class="flex items-center gap-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-ide-text-muted"
              >On Auto Forward</label
            >
            <InfoTooltip property="otherPortsAttributes" />
          </div>
          <SearchableSelect
            :model-value="
              config.otherPortsAttributes?.onAutoForward || 'notify'
            "
            :options="onAutoForwardOptions"
            @update:model-value="
              updateConfig('otherPortsAttributes.onAutoForward', $event)
            "
            placeholder="Select Action..."
          />
        </div>
      </div>
    </div>

    <div
      v-if="orchestration !== 'dockerCompose'"
      class="space-y-4 pt-4 border-t border-ide-border"
    >
      <div class="flex items-center gap-1.5">
        <SectionHeader title="Exposed App Ports" class="!mb-0" />
        <InfoTooltip property="appPort" />
      </div>
      <div class="space-y-2">
        <div
          v-for="(p, i) in Array.isArray(config.appPort)
            ? config.appPort
            : config.appPort
              ? [config.appPort]
              : []"
          :key="i"
          class="flex gap-1"
        >
          <input
            :value="p"
            @input="
              (e) => {
                const ports = Array.isArray(config.appPort)
                  ? [...config.appPort]
                  : config.appPort
                    ? [config.appPort]
                    : [];
                ports[i] = (e.target as HTMLInputElement).value;
                updateConfig('appPort', ports);
              }
            "
            type="text"
            class="ide-input flex-1 text-[10px] py-1 font-mono"
            placeholder="8080 or 8080:80"
          />
          <button
            @click="removeItem('appPort', i)"
            class="text-ide-text-muted hover:text-ide-orange"
          >
            <svg
              class="w-3 h-3"
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
        <button
          @click="
            updateConfig('appPort', [
              ...(Array.isArray(config.appPort)
                ? config.appPort
                : config.appPort
                  ? [config.appPort]
                  : []),
              '',
            ])
          "
          class="text-[8px] font-black uppercase tracking-widest text-ide-accent hover:underline"
        >
          + Add App Port
        </button>
      </div>
    </div>
  </div>
</template>
