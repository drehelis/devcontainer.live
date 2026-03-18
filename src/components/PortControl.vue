<script setup lang="ts">
import { ref } from "vue";
import SearchableSelect from "./SearchableSelect.vue";

const props = defineProps<{
  ports: (number | string)[];
  attributes: Record<string, any>;
}>();

const emit = defineEmits(["update:ports", "update:attributes"]);

const AUTO_FORWARD_OPTIONS = [
  { value: "notify", label: "Notify" },
  { value: "openBrowser", label: "Open Browser" },
  { value: "openBrowserOnce", label: "Open Browser Once" },
  { value: "openPreview", label: "Open Preview" },
  { value: "silent", label: "Silent" },
  { value: "ignore", label: "Ignore" },
];

const PROTOCOL_OPTIONS = [
  { value: "http", label: "HTTP" },
  { value: "https", label: "HTTPS" },
];

const newPort = ref<string>("");

function addPort() {
  if (!newPort.value) return;

  const portValue = newPort.value;
  if (!props.ports.includes(portValue)) {
    emit("update:ports", [...props.ports, portValue]);
    newPort.value = "";
  }
}

function removePort(index: number) {
  const newPorts = [...props.ports];
  newPorts.splice(index, 1);
  emit("update:ports", newPorts);
}

function updateAttribute(port: string | number, key: string, value: any) {
  const newAttributes = { ...props.attributes };
  const portKey = String(port);
  if (!newAttributes[portKey]) newAttributes[portKey] = {};
  newAttributes[portKey][key] = value;
  emit("update:attributes", newAttributes);
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-2">
      <input
        v-model="newPort"
        @keyup.enter="addPort"
        type="text"
        placeholder="PORT (e.g. 3000, 4000-5000, .+/server.js)"
        class="flex-1 ide-input"
      />
      <button
        @click="addPort"
        class="bg-ide-accent text-ide-bg px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-ide-accent/20"
      >
        Map
      </button>
    </div>

    <div class="space-y-3">
      <div
        v-for="(port, index) in ports"
        :key="port + '-' + index"
        class="p-3 bg-ide-activity/50 border border-ide-border rounded group animate-in fade-in slide-in-from-top-1 duration-200"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3 font-mono">
            <span class="text-ide-accent text-[10px]">●</span>
            <span class="text-ide-text-bright text-[11px]">{{ port }}</span>
          </div>
          <button
            @click="removePort(index)"
            class="text-ide-text-muted hover:text-ide-red transition-colors"
          >
            <svg
              class="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-ide-border/30"
        >
          <div class="space-y-1">
            <label
              class="text-[9px] uppercase tracking-tighter text-ide-text-muted"
              >Label</label
            >
            <input
              type="text"
              :value="attributes[String(port)]?.label"
              @input="
                updateAttribute(
                  port,
                  'label',
                  ($event.target as HTMLInputElement).value,
                )
              "
              class="ide-input w-full py-0.5 text-[10px]"
              placeholder="e.g. Web App"
            />
          </div>
          <div class="space-y-1">
            <label
              class="text-[9px] uppercase tracking-tighter text-ide-text-muted"
              >Auto Forward</label
            >
            <SearchableSelect
              :model-value="attributes[String(port)]?.onAutoForward || 'notify'"
              :options="AUTO_FORWARD_OPTIONS"
              @update:model-value="
                updateAttribute(port, 'onAutoForward', $event)
              "
            />
          </div>
          <div class="space-y-1">
            <label
              class="text-[9px] uppercase tracking-tighter text-ide-text-muted"
              >Protocol</label
            >
            <SearchableSelect
              :model-value="attributes[String(port)]?.protocol || 'http'"
              :options="PROTOCOL_OPTIONS"
              @update:model-value="updateAttribute(port, 'protocol', $event)"
            />
          </div>
          <div class="flex items-center gap-2 pt-2">
            <label class="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                :checked="attributes[String(port)]?.elevateIfNeeded"
                @change="
                  updateAttribute(
                    port,
                    'elevateIfNeeded',
                    ($event.target as HTMLInputElement).checked,
                  )
                "
                class="sr-only peer"
              />
              <div
                class="w-5 h-2.5 bg-ide-border rounded-full peer peer-checked:bg-ide-accent transition-colors relative"
              >
                <div
                  class="absolute inset-y-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full transition-transform"
                  :class="
                    attributes[String(port)]?.elevateIfNeeded
                      ? 'translate-x-2.5'
                      : 'translate-x-0'
                  "
                ></div>
              </div>
              <span class="text-[7px] font-bold uppercase opacity-50"
                >Elevate</span
              >
            </label>
            <label class="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                :checked="attributes[String(port)]?.requireLocalPort"
                @change="
                  updateAttribute(
                    port,
                    'requireLocalPort',
                    ($event.target as HTMLInputElement).checked,
                  )
                "
                class="sr-only peer"
              />
              <div
                class="w-5 h-2.5 bg-ide-border rounded-full peer peer-checked:bg-ide-accent transition-colors relative"
              >
                <div
                  class="absolute inset-y-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full transition-transform"
                  :class="
                    attributes[String(port)]?.requireLocalPort
                      ? 'translate-x-2.5'
                      : 'translate-x-0'
                  "
                ></div>
              </div>
              <span class="text-[7px] font-bold uppercase opacity-50"
                >Strict</span
              >
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
