export const GITHUB_API_BASE = "https://api.github.com";
export const GITHUB_RAW_BASE = "https://raw.githubusercontent.com";
export const MCR_PREFIX = "mcr.microsoft.com/";

export const REPOS = {
  TEMPLATES: "devcontainers/templates",
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
  // Spec
  SPEC_SCHEMA: `${GITHUB_RAW_BASE}/${REPOS.SPEC}/main/schemas/devContainer.schema.json`,

  // External
  SIMPLE_ICONS_BASE: "https://cdn.simpleicons.org",
  BUY_ME_A_COFFEE: "https://www.buymeacoffee.com/drehelis",
};

export const BASE_URL = import.meta.env.BASE_URL;

export const DATA_URLS = {
  FEATURES: `${BASE_URL}data/features.json`,
  IMAGE_TAGS: `${BASE_URL}data/imageTags.json`,
};
