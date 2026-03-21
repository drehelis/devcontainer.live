import { ref, onMounted } from "vue";
import { DATA_URLS } from "../constants/urls";
import type { FeatureMetadata } from "../types";

export function useFeatures() {
  const features = ref<FeatureMetadata[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchFeatures = async () => {
    loading.value = true;
    error.value = null;

    try {
      const res = await fetch(DATA_URLS.FEATURES);
      if (!res.ok) throw new Error("No data found");

      features.value = await res.json();
    } catch {
      error.value = "Features data not available.";
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
