<script setup lang="ts">
import { computed } from "vue";
import type { DevContainerConfig, OrchestrationType } from "../types";
import SectionHeader from "./SectionHeader.vue";
import MountsControl from "./MountsControl.vue";

const props = defineProps<{
  config: DevContainerConfig;
  orchestration: OrchestrationType;
}>();

const emit = defineEmits<{
  (e: "update:config", value: DevContainerConfig): void;
}>();

function updateConfig(path: string, value: any) {
  const newConfig = JSON.parse(JSON.stringify(props.config));
  if (path.startsWith("build.")) {
    const key = path.split(".")[1];
    newConfig.build = { ...(newConfig.build || {}), [key]: value };
  } else {
    (newConfig as any)[path] = value;
  }
  emit("update:config", newConfig);
}

const hasBashHistoryMount = computed(() => {
  return (props.config.mounts || []).some((m: any) => {
    const mount = typeof m === "string" ? m : m.target;
    return mount === "/commandhistory";
  });
});

function toggleBashHistory() {
  const existing = props.config.mounts || [];
  const bashHistoryMount = {
    source: "bash-history",
    target: "/commandhistory",
    type: "volume",
  };

  if (hasBashHistoryMount.value) {
    updateConfig(
      "mounts",
      existing.filter((m: any) => {
        const mount = typeof m === "string" ? m : m.target;
        return mount !== "/commandhistory";
      }),
    );
  } else {
    updateConfig("mounts", [...existing, bashHistoryMount]);
  }
}

const hasSecret = computed(() => {
  return props.config.build?.options?.some((opt) => opt.startsWith("--secret"));
});

const secretParams = computed(() => {
  const secretOpt = props.config.build?.options?.find((opt) =>
    opt.startsWith("--secret"),
  );
  if (!secretOpt)
    return { id: "aws", source: "file" as const, value: "~/.aws/credentials" };

  const params: Record<string, string> = {};
  const content = secretOpt.replace("--secret=", "");
  content.split(",").forEach((p) => {
    const [k, ...vParts] = p.split("=");
    if (k) params[k] = vParts.join("=");
  });

  const isEnv = "env" in params;
  return {
    id: params.id ?? "",
    source: isEnv ? ("env" as const) : ("file" as const),
    value: isEnv ? (params.env ?? "") : (params.src ?? ""),
  };
});

function updateSecretParams(newParams: {
  id: string;
  source: "file" | "env";
  value: string;
}) {
  const options = [...(props.config.build?.options || [])];
  const parts = [`id=${newParams.id}`];
  if (newParams.source === "env") {
    parts.push(`env=${newParams.value}`);
  } else {
    parts.push(`src=${newParams.value}`);
  }
  const newSecret = `--secret=${parts.join(",")}`;

  const filtered = options.filter((o) => !o.startsWith("--secret"));
  updateConfig("build.options", [...filtered, newSecret]);
}

function toggleSecret() {
  const options = [...(props.config.build?.options || [])];
  const secret = "--secret=id=aws,src=~/.aws/credentials";

  if (hasSecret.value) {
    updateConfig(
      "build.options",
      options.filter((o) => !o.startsWith("--secret")),
    );
  } else {
    updateConfig("build.options", [...options, secret]);
  }
}

const hasSSH = computed(() => {
  return props.config.build?.options?.some((opt) => opt.startsWith("--ssh"));
});

const sshParams = computed(() => {
  const sshOpt = props.config.build?.options?.find((opt) =>
    opt.startsWith("--ssh"),
  );
  if (!sshOpt) return { id: "default", value: "" };

  const content = sshOpt.replace("--ssh=", "");
  if (content.includes("=")) {
    const [id, value] = content.split("=");
    return { id, value };
  }
  return { id: content, value: "" };
});

function updateSSHParams(newParams: { id: string; value: string }) {
  const options = [...(props.config.build?.options || [])];
  const newSSH = newParams.value
    ? `--ssh=${newParams.id}=${newParams.value}`
    : `--ssh=${newParams.id}`;

  const filtered = options.filter((o) => !o.startsWith("--ssh"));
  updateConfig("build.options", [...filtered, newSSH]);
}

function toggleSSH() {
  const options = [...(props.config.build?.options || [])];
  const ssh = "--ssh=default";

  if (hasSSH.value) {
    updateConfig(
      "build.options",
      options.filter((o) => !o.startsWith("--ssh")),
    );
  } else {
    updateConfig("build.options", [...options, ssh]);
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-4">
      <SectionHeader title="Bash History" />
      <label
        class="flex items-center gap-3 p-3 bg-ide-activity/50 border border-ide-border rounded-lg cursor-pointer group hover:border-ide-accent/50 transition-colors"
      >
        <input
          type="checkbox"
          :checked="hasBashHistoryMount"
          @change="toggleBashHistory"
          class="hidden"
        />
        <div
          class="w-4 h-4 border-2 border-ide-border rounded flex items-center justify-center group-hover:border-ide-accent transition-colors"
          :class="{ 'bg-ide-accent border-ide-accent': hasBashHistoryMount }"
        >
          <svg
            v-if="hasBashHistoryMount"
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
          <span class="text-[10px] font-black uppercase tracking-widest"
            >Persist Bash History</span
          >
          <span class="text-[8px] text-ide-text-muted"
            >Keep command history across rebuilds</span
          >
        </div>
      </label>
    </div>

    <div v-if="orchestration === 'dockerfile'" class="space-y-4">
      <SectionHeader title="Build Mounts" />
      <div class="flex flex-col gap-4">
        <!-- Secret Mount -->
        <div class="flex flex-col gap-3">
          <label
            class="flex items-center gap-3 p-3 bg-ide-activity/50 border border-ide-border rounded-lg cursor-pointer group hover:border-ide-accent/50 transition-colors"
          >
            <input
              type="checkbox"
              :checked="hasSecret"
              @change="toggleSecret"
              class="hidden"
            />
            <div
              class="w-4 h-4 border-2 border-ide-border rounded flex items-center justify-center group-hover:border-ide-accent transition-colors"
              :class="{ 'bg-ide-accent border-ide-accent': hasSecret }"
            >
              <svg
                v-if="hasSecret"
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
            <div class="flex flex-col flex-1">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-black uppercase tracking-widest"
                  >Secrets Mount</span
                >
                <a
                  href="https://docs.docker.com/build/building/secrets/#secret-mounts"
                  target="_blank"
                  @click.stop
                  class="text-ide-text-muted/40 hover:text-ide-accent transition-colors"
                  title="Documentation"
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </a>
              </div>
              <span class="text-[8px] text-ide-text-muted"
                >Use host files during build</span
              >
            </div>
          </label>

          <!-- Secret Options Expansion -->
          <div
            v-if="hasSecret"
            class="ml-7 space-y-4 p-3 bg-ide-bg/30 border border-ide-border/50 rounded-lg animate-in slide-in-from-top-1 duration-200"
          >
            <div class="space-y-1.5">
              <label class="text-[8px] font-bold uppercase opacity-50"
                >Secret ID</label
              >
              <input
                type="text"
                :value="secretParams.id"
                @input="
                  updateSecretParams({
                    ...secretParams,
                    id: ($event.target as HTMLInputElement).value,
                  })
                "
                class="ide-input w-full py-1 text-[9px] h-auto"
                placeholder="aws"
              />
            </div>

            <div class="space-y-2">
              <label class="text-[8px] font-bold uppercase opacity-50"
                >Host Source Type</label
              >
              <div
                class="flex p-0.5 bg-ide-activity/30 rounded-md w-fit border border-ide-border/30"
              >
                <button
                  v-for="type in ['file', 'env']"
                  :key="type"
                  type="button"
                  @click.stop.prevent="
                    updateSecretParams({
                      id: secretParams.id,
                      source: type as any,
                      value:
                        type === 'env'
                          ? 'AWS_SECRET_ACCESS_KEY'
                          : '~/.aws/credentials',
                    })
                  "
                  class="px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded transition-all"
                  :class="
                    secretParams.source === type
                      ? 'bg-ide-accent text-ide-bg shadow-sm'
                      : 'text-ide-text-muted hover:text-ide-text'
                  "
                >
                  {{ type }}
                </button>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[8px] font-bold uppercase opacity-50">
                {{
                  secretParams.source === "env"
                    ? "Environment Variable Name"
                    : "Host Path (Source)"
                }}
              </label>
              <input
                type="text"
                :value="secretParams.value"
                @input="
                  updateSecretParams({
                    ...secretParams,
                    value: ($event.target as HTMLInputElement).value,
                  })
                "
                class="ide-input w-full py-1 text-[9px] h-auto"
                :placeholder="
                  secretParams.source === 'env'
                    ? 'AWS_SECRET_ACCESS_KEY'
                    : '~/.aws/credentials'
                "
              />
            </div>
          </div>
        </div>

        <!-- SSH Mount -->
        <div class="flex flex-col gap-3">
          <label
            class="flex items-center gap-3 p-3 bg-ide-activity/50 border border-ide-border rounded-lg cursor-pointer group hover:border-ide-accent/50 transition-colors"
          >
            <input
              type="checkbox"
              :checked="hasSSH"
              @change="toggleSSH"
              class="hidden"
            />
            <div
              class="w-4 h-4 border-2 border-ide-border rounded flex items-center justify-center group-hover:border-ide-accent transition-colors"
              :class="{ 'bg-ide-accent border-ide-accent': hasSSH }"
            >
              <svg
                v-if="hasSSH"
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
            <div class="flex flex-col flex-1">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-black uppercase tracking-widest"
                  >SSH Mount</span
                >
                <a
                  href="https://docs.docker.com/build/building/secrets/#ssh-mounts"
                  target="_blank"
                  @click.stop
                  class="text-ide-text-muted/40 hover:text-ide-accent transition-colors"
                  title="Documentation"
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </a>
              </div>
              <span class="text-[8px] text-ide-text-muted"
                >Use host SSH agent during build</span
              >
            </div>
          </label>

          <!-- SSH Options Expansion -->
          <div
            v-if="hasSSH"
            class="ml-7 space-y-3 p-3 bg-ide-bg/30 border border-ide-border/50 rounded-lg animate-in slide-in-from-top-1 duration-200"
          >
            <div class="space-y-1.5">
              <label class="text-[8px] font-bold uppercase opacity-50"
                >SSH ID</label
              >
              <input
                type="text"
                :value="sshParams.id"
                @input="
                  updateSSHParams({
                    ...sshParams,
                    id: ($event.target as HTMLInputElement).value,
                  })
                "
                class="ide-input w-full py-1 text-[9px] h-auto"
                placeholder="default"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-[8px] font-bold uppercase opacity-50"
                >Socket / Key Path (Optional)</label
              >
              <input
                type="text"
                :value="sshParams.value"
                @input="
                  updateSSHParams({
                    ...sshParams,
                    value: ($event.target as HTMLInputElement).value,
                  })
                "
                class="ide-input w-full py-1 text-[9px] h-auto"
                placeholder="/var/run/ssh-agent.sock"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <SectionHeader title="Mounts & Volumes" tooltip="mounts" />
      <MountsControl
        :mounts="config.mounts || []"
        @update:mounts="updateConfig('mounts', $event)"
      />
    </div>
  </div>
</template>
