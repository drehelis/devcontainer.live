import { ref, computed, reactive, watch, nextTick } from "vue";
import { MCR_PREFIX, DATA_URLS } from "../constants/urls";

export const sharedTagsCache = reactive<Record<string, string[]>>({});
let fetchPromise: Promise<void> | null = null;

export function ensureSharedTags() {
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch(DATA_URLS.IMAGE_TAGS)
    .then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then((data) => {
      for (const key in sharedTagsCache) {
        if (Object.prototype.hasOwnProperty.call(sharedTagsCache, key)) {
          delete sharedTagsCache[key];
        }
      }
      Object.assign(sharedTagsCache, data);
    })
    .catch(() => {
      console.warn("imageTags.json not found.");
      fetchPromise = null;
    });

  return fetchPromise;
}

export function useImageAutocomplete(
  imageRef: { value: string | undefined },
  onSelect: (img: string) => void,
) {
  ensureSharedTags();
  const tagsCache = sharedTagsCache;
  const showImageSuggestions = ref(false);
  const selectedIndex = ref(-1);
  const dropdownRef = ref<HTMLElement | null>(null);
  const suggestionItems = ref<HTMLElement[]>([]);

  const filteredImages = computed(() => {
    const input = imageRef.value || "";
    const search = input.toLowerCase();

    if (search.startsWith(MCR_PREFIX)) {
      const withoutPrefix = input.substring(MCR_PREFIX.length);
      const [baseImage, tagPart] = withoutPrefix.split(":");

      if (tagPart !== undefined) {
        const tags = tagsCache[baseImage] || [];
        const tagSearch = tagPart.toLowerCase();
        return tags
          .filter((tag) => tag.toLowerCase().includes(tagSearch))
          .map((tag) => `${MCR_PREFIX}${baseImage}:${tag}`)
          .slice(0, 100);
      }

      return Object.keys(tagsCache)
        .filter((img) =>
          img.toLowerCase().includes(withoutPrefix.toLowerCase()),
        )
        .map((img) => `${MCR_PREFIX}${img}`);
    }

    if (!search)
      return Object.keys(tagsCache).map((img) => `${MCR_PREFIX}${img}`);

    return Object.keys(tagsCache)
      .map((img) => `${MCR_PREFIX}${img}`)
      .filter((img) => img.toLowerCase().includes(search));
  });

  watch(filteredImages, () => {
    selectedIndex.value = -1;
  });

  watch(selectedIndex, async (newIndex) => {
    if (newIndex >= 0) {
      await nextTick();
      const activeItem = suggestionItems.value[newIndex];
      const container = dropdownRef.value;

      if (activeItem && container) {
        const itemTop = activeItem.offsetTop;
        const itemBottom = itemTop + activeItem.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.offsetHeight;

        if (itemTop < containerTop) {
          container.scrollTop = itemTop;
        } else if (itemBottom > containerBottom) {
          container.scrollTop = itemBottom - container.offsetHeight;
        }
      }
    }
  });

  function selectImage(img: string) {
    onSelect(img);
    if (!img.includes(":")) {
      showImageSuggestions.value = true;
      selectedIndex.value = -1;
    } else {
      showImageSuggestions.value = false;
      selectedIndex.value = -1;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!showImageSuggestions.value) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        showImageSuggestions.value = true;
      }
      return;
    }

    const listLength = filteredImages.value.length;
    if (listLength === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        selectedIndex.value = (selectedIndex.value + 1) % listLength;
        break;
      case "ArrowUp":
        e.preventDefault();
        selectedIndex.value =
          (selectedIndex.value - 1 + listLength) % listLength;
        break;
      case "Enter":
        if (selectedIndex.value >= 0 && selectedIndex.value < listLength) {
          e.preventDefault();
          selectImage(filteredImages.value[selectedIndex.value]);
        }
        break;
      case "Escape":
        e.preventDefault();
        showImageSuggestions.value = false;
        selectedIndex.value = -1;
        break;
    }
  }

  const setItemRef = (el: any, i: number) => {
    if (el) suggestionItems.value[i] = el;
  };

  return {
    filteredImages,
    showImageSuggestions,
    selectedIndex,
    dropdownRef,
    setItemRef,
    selectImage,
    handleKeyDown,
  };
}
