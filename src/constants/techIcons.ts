export const TECH_ICON_MAP: Record<string, string> = {
  node: "nodedotjs",
  typescript: "typescript",
  javascript: "javascript",
  python: "python",
  rust: "rust",
  go: "go",
  java: "openjdk",
  cpp: "cplusplus",
  "c++": "cplusplus",
  dotnet: "dotnet",
  csharp: "csharp",
  ruby: "ruby",
  php: "php",
  postgres: "postgresql",
  postgresql: "postgresql",
  mysql: "mysql",
  mariadb: "mariadb",
  redis: "redis",
  mongodb: "mongodb",
  docker: "docker",
  kubernetes: "kubernetes",
  anaconda: "anaconda",
  miniconda: "anaconda",
  conda: "anaconda",
  julia: "julia",
  r: "r",
  ubuntu: "ubuntu",
  debian: "debian",
  alpine: "alpinelinux",
  azure: "microsoftazure",
  aws: "amazonwebservices",
  gcp: "googlecloud",
  haskell: "haskell",
  elixir: "elixir",
  dart: "dart",
  flutter: "flutter",
  awscli: "amazonwebservices",
  azurecli: "microsoftazure",
  gcloud: "googlecloud",
  codespaces: "github",
  devcontainer: "docker",
  universal: "linux",
};

/**
 * Returns a tech-specific icon slug for SimpleIcons based on a template ID
 */
export function getTechIcon(id: string): string | undefined {
  const parts = id.toLowerCase().split("-");

  // Try to find direct match in any part
  for (const part of parts) {
    if (TECH_ICON_MAP[part]) return TECH_ICON_MAP[part];
  }

  // Common fallbacks
  if (id.includes("node")) return TECH_ICON_MAP.node;
  if (id.includes("python")) return TECH_ICON_MAP.python;
  if (id.includes("java")) return TECH_ICON_MAP.java;
  if (id.includes("dotnet")) return TECH_ICON_MAP.dotnet;

  return undefined;
}
