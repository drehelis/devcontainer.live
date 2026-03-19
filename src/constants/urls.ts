export const GITHUB_API_BASE = "https://api.github.com";
export const GITHUB_RAW_BASE = "https://raw.githubusercontent.com";

export const REPOS = {
  TEMPLATES: "devcontainers/templates",
  FEATURES: "devcontainers/features",
  SPEC: "devcontainers/spec",
  SELF: "drehelis/devcontainer.live",
};

export const URLS = {
  // Projects
  REPO_URL: `https://github.com/${REPOS.SELF}`,

  // Templates
  TEMPLATES_API: `${GITHUB_API_BASE}/repos/${REPOS.TEMPLATES}/contents/src`,
  TEMPLATE_CONFIG_API: (id: string) =>
    `${GITHUB_API_BASE}/repos/${REPOS.TEMPLATES}/contents/src/${id}`,

  // Features
  FEATURES_API: `${GITHUB_API_BASE}/repos/${REPOS.FEATURES}/contents/src`,
  FEATURE_METADATA_RAW: (id: string) =>
    `${GITHUB_RAW_BASE}/${REPOS.FEATURES}/main/src/${id}/devcontainer-feature.json`,

  // Spec
  SPEC_SCHEMA: `${GITHUB_RAW_BASE}/${REPOS.SPEC}/main/schemas/devContainer.schema.json`,
};
