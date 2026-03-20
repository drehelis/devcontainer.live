export type Section =
  | "presets"
  | "general"
  | "features"
  | "ports"
  | "history"
  | "advanced";

export const CONFIG_SECTIONS: { id: Section; name: string }[] = [
  { id: "presets", name: "Presets" },
  { id: "general", name: "General" },
  { id: "features", name: "Features" },
  { id: "ports", name: "Network" },
  { id: "history", name: "Mounts" },
  { id: "advanced", name: "Hooks" },
];

export const INDENTATION_OPTIONS = [
  { id: "spaces", name: "Spaces (4)" },
  { id: "tabs", name: "Tabs" },
];
