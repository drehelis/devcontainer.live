import { ref, onMounted } from "vue";
import type { OrchestrationType } from "../types";

export interface OfficialTemplate {
  id: string;
  name: string;
  description: string;
  orchestration: OrchestrationType;
  image: string;
}

export function usePresets() {
  const templates = ref<OfficialTemplate[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchOfficialTemplates() {
    loading.value = true;
    error.value = null;
    try {
      // Fetch the src directory contents from the official repo
      const response = await fetch(
        "https://api.github.com/repos/devcontainers/templates/contents/src",
      );
      if (!response.ok) throw new Error("Failed to fetch official templates catalog.");
      const data = await response.json();

      // Map to our format
      // Note: We don't have the full metadata (description) without fetching each devcontainer-template.json
      // To keep it "slim" and fast, we'll use the names.
      templates.value = data
        .filter((item: any) => item.type === "dir")
        .map((item: any) => {
          const name = item.name
            .split("-")
            .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ");
          
          return {
            id: item.name,
            name: name,
            description: `Official ${name} template from Microsoft.`,
            orchestration: "image" as OrchestrationType,
            image: `ghcr.io/devcontainers/templates/${item.name}:latest`,
          };
        });
    } catch (e: any) {
      error.value = e.message;
      // Fallback to minimal sensible list if API fails
      templates.value = [
        { id: "javascript-node", name: "Node.js", description: "Official Node.js template.", orchestration: "image", image: "ghcr.io/devcontainers/templates/javascript-node:latest" },
        { id: "python", name: "Python 3", description: "Official Python 3 template.", orchestration: "image", image: "ghcr.io/devcontainers/templates/python:latest" },
      ];
    } finally {
      loading.value = false;
    }
  }

  async function fetchTemplateConfig(templateId: string) {
    const baseUrl = `https://raw.githubusercontent.com/devcontainers/templates/main/src/${templateId}`;
    
    const [configRes, metadataRes] = await Promise.all([
      fetch(`${baseUrl}/.devcontainer/devcontainer.json`).then(r => r.ok ? r : fetch(`${baseUrl}/devcontainer.json`)),
      fetch(`${baseUrl}/devcontainer-template.json`)
    ]);

    let config = null;
    let metadata = null;

    if (configRes.ok) {
      const text = await configRes.text();
      // Remove comments if any
      const rawConfig = JSON.parse(text.replace(/\/\/.*$/gm, ""));
      
      // If we have metadata, substitute template options
      if (metadataRes.ok) {
        metadata = await metadataRes.json();
        config = substituteTemplateOptions(rawConfig, metadata);
      } else {
        config = rawConfig;
      }
    }

    return { config, metadata };
  }

  onMounted(() => {
    fetchOfficialTemplates();
  });

  return {
    templates,
    loading,
    error,
    refresh: fetchOfficialTemplates,
    fetchTemplateConfig,
  };
}

export function substituteTemplateOptions(config: any, metadata: any, userValues: Record<string, string> = {}) {
  // Combine official defaults with user provided values
  const values: Record<string, string> = {};
  if (metadata?.options) {
    Object.entries(metadata.options as Record<string, any>).forEach(([key, opt]) => {
      values[key] = String(userValues[key] ?? opt.default ?? "");
    });
  }

  // Deep replacement function
  function transform(obj: any): any {
    if (typeof obj === "string") {
      return obj.replace(/\${templateOption:([^}]+)}/g, (_, key) => {
        return values[key] !== undefined ? values[key] : _;
      });
    }
    if (Array.isArray(obj)) {
      return obj.map(transform);
    }
    if (obj !== null && typeof obj === "object") {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = transform(value);
      }
      return result;
    }
    return obj;
  }

  return transform(config);
}
