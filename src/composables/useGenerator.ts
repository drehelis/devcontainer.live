import { ref, computed, watch } from "vue";
import LZString from "lz-string";
import type { DevContainerConfig, OrchestrationType } from "../types";
import { URLS } from "../constants/urls";
import { DEFAULT_STATE } from "../constants/defaults";
import { STORAGE_KEYS } from "../constants/storage";

export function useGenerator() {
  const getHashState = () => {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(hash);
      return decompressed ? JSON.parse(decompressed) : null;
    } catch (e) {
      return null;
    }
  };

  const initialHash = window.location.hash.slice(1);
  const savedState = getHashState() || localStorage.getItem(STORAGE_KEYS.STATE);

  // Clear hash from URL if present to keep it clean
  if (initialHash) {
    const url = new URL(window.location.href);
    url.hash = "";
    history.replaceState(null, "", url.toString());
  }

  let parsed: any = null;
  try {
    parsed =
      typeof savedState === "string" ? JSON.parse(savedState) : savedState;
  } catch (e) {
    parsed = null;
  }

  const state = ref<{
    orchestration: OrchestrationType;
    presetFiles: Record<string, string>;
    config: DevContainerConfig;
  }>(
    JSON.parse(
      JSON.stringify(parsed?.state?.config ? parsed.state : DEFAULT_STATE),
    ),
  );

  const indentation = ref(parsed?.indentation ?? -1);

  function syncNetworkFlags(newConfig: any, orchestration: OrchestrationType) {
    const flags = [
      "--network=host",
      "--add-host=host.docker.internal:host-gateway",
    ];

    if (orchestration === "image") {
      flags.forEach((flag) => {
        const inBuild = newConfig.build?.options?.includes(flag);
        if (inBuild) {
          newConfig.build.options = newConfig.build.options.filter(
            (o: string) => o !== flag,
          );
          if (!newConfig.runArgs?.includes(flag)) {
            newConfig.runArgs = [...(newConfig.runArgs || []), flag];
          }
        }
      });
    } else if (orchestration === "dockerfile") {
      flags.forEach((flag) => {
        const inRun = newConfig.runArgs?.includes(flag);
        if (inRun) {
          newConfig.runArgs = newConfig.runArgs.filter(
            (a: string) => a !== flag,
          );
          if (!newConfig.build) newConfig.build = {};
          if (!newConfig.build.options?.includes(flag)) {
            newConfig.build.options = [
              ...(newConfig.build.options || []),
              flag,
            ];
          }
        }
      });
    }

    if (newConfig.runArgs?.length === 0) delete newConfig.runArgs;
    if (newConfig.build?.options?.length === 0) delete newConfig.build.options;
    if (newConfig.build && Object.keys(newConfig.build).length === 0)
      delete newConfig.build;
  }

  watch(
    [state, indentation],
    ([newState], [oldState]) => {
      if (
        oldState &&
        newState.orchestration !== (oldState as typeof newState).orchestration
      ) {
        const newConfig = JSON.parse(JSON.stringify(newState.config));
        syncNetworkFlags(newConfig, newState.orchestration);
        state.value.config = newConfig;
      }

      const data = {
        state: state.value,
        indentation: indentation.value,
      };
      localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(data));
    },
    { deep: true, immediate: true },
  );

  function reset() {
    state.value = JSON.parse(JSON.stringify(DEFAULT_STATE));
    indentation.value = -1;
  }

  const generatedJson = computed(() => {
    const config = JSON.parse(
      JSON.stringify(state.value.config || DEFAULT_STATE.config),
    );
    const orchestration = state.value.orchestration;

    if (orchestration === "dockerfile") {
      const build = config.build || {};
      const dockerfilePath =
        build.dockerfile || build.dockerFile || "Dockerfile";
      const isCamelCase = !!build.dockerFile && !build.dockerfile;

      config.build = {
        [isCamelCase ? "dockerFile" : "dockerfile"]: dockerfilePath,
        context: build.context || ".",
        ...(build.args && Object.keys(build.args).length > 0
          ? { args: build.args }
          : {}),
        ...(build.target ? { target: build.target } : {}),
        ...(build.cacheFrom ? { cacheFrom: build.cacheFrom } : {}),
        ...(build.options && build.options.length > 0
          ? { options: build.options }
          : {}),
      };

      delete config.image;
      delete config.dockerComposeFile;
      delete config.service;
    } else if (orchestration === "image") {
      delete config.build;
      delete config.dockerComposeFile;
      delete config.service;
    } else if (orchestration === "dockerCompose") {
      delete config.image;
      delete config.build;
    }

    // Filter out empty arrays/objects to keep JSON clean
    const cleanConfig: any = {
      $schema: URLS.SPEC_SCHEMA,
    };

    // Core properties
    if (config.name) cleanConfig.name = config.name;
    if (config.image && orchestration === "image")
      cleanConfig.image = config.image;
    if (config.build && orchestration === "dockerfile") {
      // Small cleanup: if only dockerfile and context are present, we could potentially simplify,
      // but the grouping above ensures they are there.
      cleanConfig.build = config.build;
    }
    if (config.dockerComposeFile && orchestration === "dockerCompose") {
      cleanConfig.dockerComposeFile = config.dockerComposeFile;
      cleanConfig.service = config.service;
      if (config.runServices && config.runServices.length > 0) {
        cleanConfig.runServices = config.runServices;
      }
    }

    // Common optional properties
    if (config.workspaceFolder)
      cleanConfig.workspaceFolder = config.workspaceFolder;
    if (config.workspaceMount)
      cleanConfig.workspaceMount = config.workspaceMount;
    if (config.appPort) cleanConfig.appPort = config.appPort;
    if (config.remoteUser) cleanConfig.remoteUser = config.remoteUser;
    if (config.containerUser) cleanConfig.containerUser = config.containerUser;
    if (config.updateRemoteUserUID)
      cleanConfig.updateRemoteUserUID = config.updateRemoteUserUID;
    if (config.userEnvProbe) cleanConfig.userEnvProbe = config.userEnvProbe;
    if (config.waitFor) cleanConfig.waitFor = config.waitFor;

    // Environment
    if (config.containerEnv && Object.keys(config.containerEnv).length > 0) {
      cleanConfig.containerEnv = config.containerEnv;
    }
    if (config.remoteEnv && Object.keys(config.remoteEnv).length > 0) {
      cleanConfig.remoteEnv = config.remoteEnv;
    }

    // Features
    if (config.features && Object.keys(config.features).length > 0) {
      cleanConfig.features = config.features;
    }
    if (
      config.overrideFeatureInstallOrder &&
      config.overrideFeatureInstallOrder.length > 0
    ) {
      cleanConfig.overrideFeatureInstallOrder =
        config.overrideFeatureInstallOrder;
    }

    // Ports
    if (config.forwardPorts && config.forwardPorts.length > 0) {
      cleanConfig.forwardPorts = config.forwardPorts;
    }
    if (
      config.portsAttributes &&
      Object.keys(config.portsAttributes).length > 0
    ) {
      cleanConfig.portsAttributes = config.portsAttributes;
    }
    if (
      config.otherPortsAttributes &&
      Object.keys(config.otherPortsAttributes).length > 0
    ) {
      cleanConfig.otherPortsAttributes = config.otherPortsAttributes;
    }

    // Docker Run parameters
    if (config.privileged) cleanConfig.privileged = config.privileged;
    if (config.init) cleanConfig.init = config.init;
    if (config.capAdd && config.capAdd.length > 0)
      cleanConfig.capAdd = config.capAdd;
    if (config.securityOpt && config.securityOpt.length > 0)
      cleanConfig.securityOpt = config.securityOpt;
    if (config.runArgs && config.runArgs.length > 0)
      cleanConfig.runArgs = config.runArgs;
    if (config.shutdownAction && config.shutdownAction !== "none")
      cleanConfig.shutdownAction = config.shutdownAction;
    if (config.overrideCommand !== undefined)
      cleanConfig.overrideCommand = config.overrideCommand;

    // lifecycle hooks
    const hooks = [
      "initializeCommand",
      "onCreateCommand",
      "updateContentCommand",
      "postCreateCommand",
      "postStartCommand",
      "postAttachCommand",
    ];
    hooks.forEach((hook) => {
      if (config[hook]) {
        if (typeof config[hook] === "object" && !Array.isArray(config[hook])) {
          // parallel execution format
          const filtered = Object.fromEntries(
            Object.entries(config[hook]).filter(([_, v]) => v !== ""),
          );
          if (Object.keys(filtered).length > 0) cleanConfig[hook] = filtered;
        } else if (config[hook] !== "") {
          cleanConfig[hook] = config[hook];
        }
      }
    });

    // Mounts
    if (config.mounts && config.mounts.length > 0) {
      cleanConfig.mounts = config.mounts.map((m: any) => {
        if (typeof m === "string") return m;
        const parts = [];
        if (m.source) parts.push(`source=${m.source}`);
        if (m.target) parts.push(`target=${m.target}`);
        if (m.type) parts.push(`type=${m.type}`);
        if (m.readonly) parts.push("readonly");
        if (m.options) parts.push(m.options);
        return parts.join(",");
      });
    }

    // Host Requirements
    if (
      config.hostRequirements &&
      Object.keys(config.hostRequirements).length > 0
    ) {
      const hr: any = {};
      if (config.hostRequirements.cpus) hr.cpus = config.hostRequirements.cpus;
      if (config.hostRequirements.memory)
        hr.memory = config.hostRequirements.memory;
      if (config.hostRequirements.storage)
        hr.storage = config.hostRequirements.storage;
      if (config.hostRequirements.gpu) hr.gpu = config.hostRequirements.gpu;

      if (Object.keys(hr).length > 0) cleanConfig.hostRequirements = hr;
    }

    // Customizations
    if (
      config.customizations &&
      Object.keys(config.customizations).length > 0
    ) {
      cleanConfig.customizations = config.customizations;
    }

    const indent = indentation.value === -1 ? "\t" : indentation.value;
    return JSON.stringify(cleanConfig, null, indent);
  });

  const extraNotes = computed(() => {
    const notes: string[] = [];
    const config = state.value.config;
    const orchestration = state.value.orchestration;

    // Bash History Note
    const hasBashHistory = config.mounts?.some((m: any) => {
      if (typeof m === "string") return m.includes("commandhistory");
      return m?.target === "/commandhistory";
    });
    if (hasBashHistory) {
      notes.push(
        "To persist bash history, add this to your .bashrc:\nexport PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history",
      );
    }

    // Secrets Note
    if (orchestration === "dockerfile") {
      const secretOpt = config.build?.options?.find((opt) =>
        opt.startsWith("--secret"),
      );
      if (secretOpt) {
        const idMatch = secretOpt.match(/id=([^,]+)/);
        const secretId = idMatch ? idMatch[1] : "";

        if (secretOpt.includes("env=")) {
          const envMatch = secretOpt.match(/env=([^,]+)/);
          const envName = envMatch ? envMatch[1] : "MY_SECRET";
          notes.push(
            `Use as environment variable:\nRUN --mount=type=secret,id=${secretId},env=${envName} install_command`,
          );
        } else {
          const srcMatch = secretOpt.match(/src=([^,]+)/);
          const src = srcMatch ? srcMatch[1] : "";

          // Use a default path but replace home alias if present
          let targetPath = src || `/run/secrets/${secretId}`;
          if (targetPath.startsWith("~")) {
            targetPath = targetPath.replace("~", "/root");
          }

          notes.push(
            `Add to your Dockerfile:\nRUN --mount=type=secret,id=${secretId},target=${targetPath} install_command`,
          );
        }
      }

      const sshOpt = config.build?.options?.find((opt) =>
        opt.startsWith("--ssh"),
      );
      if (sshOpt) {
        const content = sshOpt.replace("--ssh=", "");
        const sshId = content.includes("=") ? content.split("=")[0] : content;
        const mountFlags = sshId === "default" ? "" : `,id=${sshId}`;

        notes.push(
          `To use SSH in your Dockerfile:\nRUN --mount=type=ssh${mountFlags} ssh -q -T git@gitlab.com`,
        );
      }
    }

    return notes.length > 0 ? notes : undefined;
  });

  function getShareUrl() {
    const data = {
      state: state.value,
      indentation: indentation.value,
    };
    const stringified = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(stringified);
    const url = new URL(window.location.href);
    url.hash = compressed;
    return url.toString();
  }

  const allFiles = computed(() => {
    const files: Record<string, { content: string; language: string }> = {
      "devcontainer.json": {
        content: generatedJson.value,
        language: "json",
      },
    };

    if (state.value.presetFiles) {
      Object.entries(state.value.presetFiles).forEach(([name, content]) => {
        let language = "text";
        if (name.toLowerCase() === "dockerfile") language = "dockerfile";
        if (name.endsWith(".yml") || name.endsWith(".yaml")) language = "yaml";
        if (name.endsWith(".json")) language = "json";
        if (name.endsWith(".sh")) language = "shell";

        files[name] = { content, language };
      });
    }

    return files;
  });

  return {
    state,
    generatedJson,
    allFiles,
    extraNotes,
    indentation,
    reset,
    getShareUrl,
  };
}
