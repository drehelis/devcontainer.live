<script setup lang="ts">
import type { DevContainerConfig } from "../../../../types";
import SectionHeader from "../../../SectionHeader.vue";
import InfoTooltip from "../../../InfoTooltip.vue";
import SearchableSelect from "../../../SearchableSelect.vue";

const props = defineProps<{
  config: DevContainerConfig;
}>();

const emit = defineEmits<{
  (e: "update:config", val: DevContainerConfig): void;
}>();

const shutdownActionOptions = [
  { value: "none", label: "None" },
  { value: "stopContainer", label: "Stop Container" },
  { value: "stopCompose", label: "Stop Compose" },
];

const CAP_OPTIONS = [
  { value: "SYS_PTRACE", label: "SYS_PTRACE (Debugging)" },
  { value: "SYS_ADMIN", label: "SYS_ADMIN (Admin tasks)" },
  { value: "NET_ADMIN", label: "NET_ADMIN (Network config)" },
  { value: "SYS_MODULE", label: "SYS_MODULE (Load modules)" },
  { value: "SYS_RAWIO", label: "SYS_RAWIO (I/O access)" },
  { value: "SYS_TIME", label: "SYS_TIME (Set system clock)" },
  { value: "CHOWN", label: "CHOWN (Change ownership)" },
  { value: "DAC_OVERRIDE", label: "DAC_OVERRIDE (Bypass file checks)" },
  { value: "FOWNER", label: "FOWNER (Bypass owner checks)" },
  { value: "FSETID", label: "FSETID (Ignore setuid/setgid)" },
  { value: "KILL", label: "KILL (Kill processes)" },
  { value: "SETGID", label: "SETGID (Set GID)" },
  { value: "SETUID", label: "SETUID (Set UID)" },
  { value: "SETPCAP", label: "SETPCAP (Set capabilities)" },
  { value: "NET_BIND_SERVICE", label: "NET_BIND_SERVICE (Bind low ports)" },
  { value: "NET_RAW", label: "NET_RAW (Raw sockets)" },
  { value: "IPC_LOCK", label: "IPC_LOCK (Lock memory)" },
  { value: "IPC_OWNER", label: "IPC_OWNER (Bypass IPC checks)" },
  { value: "SYS_CHROOT", label: "SYS_CHROOT (Chroot)" },
  { value: "MKNOD", label: "MKNOD (Create device nodes)" },
  { value: "AUDIT_WRITE", label: "AUDIT_WRITE (Write audit logs)" },
  { value: "AUDIT_CONTROL", label: "AUDIT_CONTROL (Configure auditing)" },
  { value: "SETFCAP", label: "SETFCAP (Set file capabilities)" },
];

const SECURITY_OPTIONS = [
  { value: "seccomp=unconfined", label: "Seccomp: Unconfined" },
  { value: "apparmor=unconfined", label: "AppArmor: Unconfined" },
  { value: "label=disable", label: "SELinux: Disable" },
  { value: "no-new-privileges", label: "No New Privileges" },
];

function updateConfig(path: string, value: any) {
  emit("update:config", { ...props.config, [path]: value });
}

function removeItem(path: "capAdd" | "securityOpt", index: number) {
  const currentVal = props.config[path] || [];
  const list = [...currentVal];
  list.splice(index, 1);
  updateConfig(path, list);
}
</script>

<template>
  <div class="space-y-6">
    <SectionHeader title="Docker Runtime" />
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <label
          class="flex items-center gap-3 p-3 bg-ide-activity/50 border border-ide-border rounded-lg cursor-pointer group hover:border-ide-accent/50 transition-colors"
        >
          <input
            type="checkbox"
            :checked="config.privileged"
            @change="
              updateConfig(
                'privileged',
                ($event.target as HTMLInputElement).checked,
              )
            "
            class="hidden"
          />
          <div
            class="w-4 h-4 border-2 border-ide-border rounded flex items-center justify-center group-hover:border-ide-accent transition-colors"
            :class="{ 'bg-ide-accent border-ide-accent': config.privileged }"
          >
            <svg
              v-if="config.privileged"
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
                >Privileged</span
              >
              <InfoTooltip property="privileged" />
            </div>
            <span class="text-[8px] text-ide-text-muted">Full root access</span>
          </div>
        </label>
        <label
          class="flex items-center gap-3 p-3 bg-ide-activity/50 border border-ide-border rounded-lg cursor-pointer group hover:border-ide-accent/50 transition-colors"
        >
          <input
            type="checkbox"
            :checked="config.init"
            @change="
              updateConfig('init', ($event.target as HTMLInputElement).checked)
            "
            class="hidden"
          />
          <div
            class="w-4 h-4 border-2 border-ide-border rounded flex items-center justify-center group-hover:border-ide-accent transition-colors"
            :class="{ 'bg-ide-accent border-ide-accent': config.init }"
          >
            <svg
              v-if="config.init"
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
                >Init Process</span
              >
              <InfoTooltip property="init" />
            </div>
            <span class="text-[8px] text-ide-text-muted">Use Tini init</span>
          </div>
        </label>
      </div>

      <div class="space-y-2">
        <div class="flex items-center gap-1.5">
          <label
            class="text-[9px] font-black uppercase tracking-widest text-ide-text-muted"
            >Shutdown Action</label
          >
          <InfoTooltip property="shutdownAction" />
        </div>
        <SearchableSelect
          :model-value="config.shutdownAction || 'none'"
          :options="shutdownActionOptions"
          @update:model-value="updateConfig('shutdownAction', $event)"
          placeholder="Select Action..."
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <div class="flex items-center gap-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-ide-text-muted"
              >Cap Add</label
            >
            <InfoTooltip property="capAdd" />
          </div>
          <div class="space-y-1">
            <div v-for="(cap, i) in config.capAdd" :key="i" class="flex gap-1">
              <SearchableSelect
                :model-value="cap"
                :options="CAP_OPTIONS"
                @update:model-value="
                  (val) => {
                    const caps = [...(config.capAdd || [])];
                    caps[i] = val;
                    updateConfig('capAdd', caps);
                  }
                "
                class="flex-1"
              />
              <button
                @click="removeItem('capAdd', i)"
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
              @click="updateConfig('capAdd', [...(config.capAdd || []), ''])"
              class="text-[8px] font-black uppercase tracking-widest text-ide-accent hover:underline"
            >
              + Add Cap
            </button>
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex items-center gap-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-ide-text-muted"
              >Security Opt</label
            >
            <InfoTooltip property="securityOpt" />
          </div>
          <div class="space-y-1">
            <div
              v-for="(opt, i) in config.securityOpt"
              :key="i"
              class="flex gap-1"
            >
              <SearchableSelect
                :model-value="opt"
                :options="SECURITY_OPTIONS"
                @update:model-value="
                  (val) => {
                    const opts = [...(config.securityOpt || [])];
                    opts[i] = val;
                    updateConfig('securityOpt', opts);
                  }
                "
                class="flex-1"
              />
              <button
                @click="removeItem('securityOpt', i)"
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
                updateConfig('securityOpt', [...(config.securityOpt || []), ''])
              "
              class="text-[8px] font-black uppercase tracking-widest text-ide-accent hover:underline"
            >
              + Add Opt
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
