import { ref, onMounted } from "vue";

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

    try {
      const res = await fetch("/data/features.json");
      if (!res.ok) throw new Error("No data found");

      features.value = await res.json();
    } catch (err: any) {
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
