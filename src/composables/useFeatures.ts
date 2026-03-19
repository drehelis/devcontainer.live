import { ref, onMounted } from "vue";
import { URLS } from "../constants/urls";
import { STORAGE_KEYS } from "../constants/storage";
import { CACHE_TTL_FEATURES } from "../constants/defaults";

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

export function useFeatures() {
  const features = ref<FeatureMetadata[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchFeatures = async () => {
    loading.value = true;
    error.value = null;

    // Check cache
    const cached = localStorage.getItem(STORAGE_KEYS.FEATURES);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_FEATURES) {
        features.value = data;
        loading.value = false;
        return;
      }
    }

    try {
      // 1. Fetch feature list from GH API
      const listRes = await fetch(URLS.FEATURES_API);
      if (!listRes.ok) throw new Error("Failed to fetch features list");

      const contents = await listRes.json();
      const featureDirs = contents
        .filter((item: any) => item.type === "dir")
        .map((item: any) => item.name);

      // 2. Fetch metadata for each feature
      // Note: Doing this in parallel might hit rate limits, but let's try a small batch or sequential
      // For now, let's fetch a subset or use a more efficient way if possible.
      // Actually, containers.dev must have a consolidated list somewhere.
      // If we can't find it, we'll fetch them individually but maybe limit it or cache heavily.

      const featureData: FeatureMetadata[] = [];

      // Fetch in chunks to avoid overwhelming or hitting limits early
      const chunks = [];
      for (let i = 0; i < featureDirs.length; i += 5) {
        chunks.push(featureDirs.slice(i, i + 5));
      }

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (dirName: string) => {
            try {
              const metaRes = await fetch(URLS.FEATURE_METADATA_RAW(dirName));
              if (metaRes.ok) {
                const meta = await metaRes.json();
                featureData.push({
                  id: `ghcr.io/devcontainers/features/${dirName}:1`,
                  name: meta.name || dirName,
                  description: meta.description,
                  options: meta.options,
                  category: meta.category || "Other",
                  documentationURL: meta.documentationURL,
                });
              }
            } catch (e) {
              console.error(`Failed to fetch metadata for ${dirName}`, e);
            }
          }),
        );
      }

      features.value = featureData;

      // Cache the result
      localStorage.setItem(
        STORAGE_KEYS.FEATURES,
        JSON.stringify({
          data: featureData,
          timestamp: Date.now(),
        }),
      );
    } catch (err: any) {
      error.value = err.message;
      // If fetch fails, try to use stale cache if available
      if (cached) {
        const { data } = JSON.parse(cached);
        features.value = data;
      }
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (features.value.length === 0) {
      fetchFeatures();
    }
  });

  return {
    features,
    loading,
    error,
    refresh: fetchFeatures,
  };
}
