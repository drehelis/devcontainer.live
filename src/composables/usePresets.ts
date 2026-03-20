import { ref, onMounted } from "vue";
import type {
  OrchestrationType,
  OfficialTemplate,
  TemplateMetadata,
} from "../types";
import { URLS } from "../constants/urls";
import { getTechIcon } from "../constants/techIcons";

export function usePresets() {
  const templates = ref<OfficialTemplate[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchOfficialTemplates() {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(URLS.TEMPLATES_API);

      if (response.status === 403) {
        throw new Error(
          "GitHub API rate limit reached. Using fallback templates.",
        );
      }

      if (!response.ok) {
        throw new Error("Failed to fetch official templates catalog.");
      }

      const data = await response.json();

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
            icon: getTechIcon(item.name),
          };
        });
    } catch (e: any) {
      error.value = e.message;
      templates.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchTemplateConfig(templateId: string) {
    const apiBaseUrl = URLS.TEMPLATE_CONFIG_API(templateId);

    let config = null;
    let metadata = null;
    let dockerfile = null;
    let dockerCompose = null;

    try {
      const [rootFiles, devContainerFiles] = await Promise.all([
        fetch(apiBaseUrl).then((r) => (r.ok ? r.json() : [])),
        fetch(`${apiBaseUrl}/.devcontainer`).then((r) =>
          r.ok ? r.json() : [],
        ),
      ]);

      const findFile = (name: string) => {
        const inDevContainer =
          Array.isArray(devContainerFiles) &&
          devContainerFiles.find(
            (f: any) => f.name.toLowerCase() === name.toLowerCase(),
          );
        if (inDevContainer) return inDevContainer;
        return (
          Array.isArray(rootFiles) &&
          rootFiles.find(
            (f: any) => f.name.toLowerCase() === name.toLowerCase(),
          )
        );
      };

      const configEntry = findFile("devcontainer.json");
      const metadataEntry = findFile("devcontainer-template.json");
      const dockerfileEntry = findFile("Dockerfile");
      const composeEntry =
        findFile("docker-compose.yml") || findFile("docker-compose.yaml");

      const fetchQueue: Promise<any>[] = [];

      const addFetch = (entry: any, type: "json" | "text") => {
        if (entry?.download_url) {
          fetchQueue.push(fetch(entry.download_url).then((r) => r[type]()));
        } else {
          fetchQueue.push(Promise.resolve(null));
        }
      };

      addFetch(configEntry, "text");
      addFetch(metadataEntry, "json");
      addFetch(dockerfileEntry, "text");
      addFetch(composeEntry, "text");

      const [configText, metadataJson, dockerfileText, composeText] =
        await Promise.all(fetchQueue);

      if (configText) {
        try {
          const rawConfig = JSON.parse(configText.replace(/\/\/.*$/gm, ""));
          config = metadataJson
            ? substituteTemplateOptions(rawConfig, metadataJson)
            : rawConfig;
          metadata = metadataJson;
        } catch (e) {
          console.error("Failed to parse devcontainer.json", e);
        }
      }

      dockerfile = dockerfileText;
      dockerCompose = composeText;
    } catch (e) {
      console.error("Error fetching template config", e);
    }

    return { config, metadata, dockerfile, dockerCompose };
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

export function substituteTemplateOptions(
  config: any,
  metadata: TemplateMetadata,
  userValues: Record<string, string> = {},
) {
  const values: Record<string, string> = {};
  if (metadata?.options) {
    Object.entries(metadata.options).forEach(([key, opt]) => {
      values[key] = String(userValues[key] ?? opt.default ?? "");
    });
  }

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
