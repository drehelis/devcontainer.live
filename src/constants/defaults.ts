import type { DevContainerConfig, OrchestrationType } from "../types";

export const CACHE_TTL_FEATURES = 1000 * 60 * 60 * 24; // 24 hours

export const DEFAULT_CONFIG: DevContainerConfig = {
  name: "devcontainer.live",
  image: "mcr.microsoft.com/devcontainers/base:ubuntu",
  build: {
    dockerfile: "Dockerfile",
    context: ".",
    args: {},
  },
  dockerComposeFile: ["docker-compose.yml"],
  service: "app",
  features: {},
  forwardPorts: [],
  portsAttributes: {},
  containerEnv: {},
  remoteEnv: {},
  postCreateCommand: "",
  customizations: {
    vscode: {
      extensions: [],
      settings: {},
    },
  },
  privileged: false,
  init: false,
  capAdd: [],
  securityOpt: [],
};

export const DEFAULT_STATE = {
  orchestration: "image" as OrchestrationType,
  presetFiles: {} as Record<string, string>,
  config: DEFAULT_CONFIG,
};
