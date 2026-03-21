export interface Theme {
  id: string;
  name: string;
  class: string;
}

export interface FeatureOption {
  type: "string" | "boolean";
  description?: string;
  default?: any;
  proposals?: any[];
  enum?: any[];
}

export interface FeatureMetadata {
  id: string;
  name: string;
  description?: string;
  options?: Record<string, FeatureOption>;
  category?: string;
  documentationURL?: string;
}

export interface GeneratorState {
  orchestration: OrchestrationType;
  presetFiles: Record<string, string>;
  config: DevContainerConfig;
}

export interface EditorFile {
  content: string;
  language: string;
}

export type Section =
  | "presets"
  | "general"
  | "features"
  | "ports"
  | "mounts"
  | "advanced";

export interface DevContainerConfig {
  name: string;
  image?: string;
  build?: {
    dockerfile?: string;
    dockerFile?: string;
    context?: string;
    args?: Record<string, string | string[]>;
    target?: string;
    cacheFrom?: string | string[];
    options?: string[];
  };
  dockerComposeFile?: string | string[];
  service?: string;
  runServices?: string[];
  workspaceFolder?: string;
  workspaceMount?: string;
  appPort?: number | string | (number | string)[];
  features?: Record<string, string | boolean | Record<string, any>>;
  overrideFeatureInstallOrder?: string[];
  forwardPorts?: (number | string)[];
  portsAttributes?: Record<
    string,
    {
      label?: string;
      onAutoForward?:
        | "notify"
        | "openBrowser"
        | "openBrowserOnce"
        | "openPreview"
        | "silent"
        | "ignore";
      elevateIfNeeded?: boolean;
      requireLocalPort?: boolean;
      protocol?: "http" | "https";
    }
  >;
  otherPortsAttributes?: {
    label?: string;
    onAutoForward?:
      | "notify"
      | "openBrowser"
      | "openPreview"
      | "silent"
      | "ignore";
    elevateIfNeeded?: boolean;
    requireLocalPort?: boolean;
    protocol?: "http" | "https";
  };
  mounts?: (
    | string
    | {
        source: string;
        target: string;
        type: "bind" | "volume";
        [key: string]: any;
      }
  )[];
  containerEnv?: Record<string, string>;
  remoteEnv?: Record<string, string | null>;
  containerUser?: string;
  remoteUser?: string;
  updateRemoteUserUID?: boolean;
  userEnvProbe?:
    | "none"
    | "loginShell"
    | "loginInteractiveShell"
    | "interactiveShell";
  overrideCommand?: boolean;
  shutdownAction?: "none" | "stopContainer" | "stopCompose";
  init?: boolean;
  privileged?: boolean;
  capAdd?: string[];
  securityOpt?: string[];
  runArgs?: string[];
  initializeCommand?: string | string[] | Record<string, string | string[]>;
  onCreateCommand?: string | string[] | Record<string, string | string[]>;
  updateContentCommand?: string | string[] | Record<string, string | string[]>;
  postCreateCommand?: string | string[] | Record<string, string | string[]>;
  postStartCommand?: string | string[] | Record<string, string | string[]>;
  postAttachCommand?: string | string[] | Record<string, string | string[]>;
  waitFor?:
    | "initializeCommand"
    | "onCreateCommand"
    | "updateContentCommand"
    | "postCreateCommand"
    | "postStartCommand";
  hostRequirements?: {
    cpus?: number;
    memory?: string;
    storage?: string;
    gpu?: boolean | "optional" | { cores?: number; memory?: string };
  };
  customizations?: Record<string, any>;
}

export type OrchestrationType = "image" | "dockerfile" | "dockerCompose";

export interface TemplateOption {
  type: "string" | "boolean" | "enum";
  default?: string | boolean;
  description?: string;
  enum?: string[] | number[];
  proposals?: string[] | number[];
}

export interface TemplateMetadata {
  id: string;
  name: string;
  version?: string;
  options?: Record<string, TemplateOption>;
  [key: string]: any;
}

export interface OfficialTemplate {
  id: string;
  name: string;
  description: string;
  orchestration: OrchestrationType;
  image: string;
  icon?: string;
}

export interface PresetApplyPayload {
  orchestration: OrchestrationType;
  config: DevContainerConfig;
  dockerfile: string | null;
  dockerCompose: string | null;
}

export interface PresetConfigState {
  config: DevContainerConfig;
  metadata: TemplateMetadata;
  userValues: Record<string, string>;
  dockerfile: string | null;
  dockerCompose: string | null;
}
