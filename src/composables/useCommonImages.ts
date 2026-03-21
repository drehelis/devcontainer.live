import { ref, computed, watch, nextTick } from "vue";
import { sharedTagsCache, ensureSharedTags } from "./useImageAutocomplete";
import { MCR_PREFIX } from "../constants/urls";

export function useCommonImages(imageValue: () => string | undefined) {
  ensureSharedTags();
  const tagsCache = sharedTagsCache;
  const showSuggestions = ref(false);
  const selectedIndex = ref(-1);
  const suggestionItems = ref<HTMLElement[]>([]);
  const dropdownRef = ref<HTMLElement | null>(null);

  const setItemRef = (el: any, i: number) => {
    if (el) suggestionItems.value[i] = el;
  };

  const filteredImages = computed(() => {
    const input = imageValue() || "";
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

  watch(selectedIndex, async () => {
    if (selectedIndex.value >= 0) {
      await nextTick();
      const activeItem = suggestionItems.value[selectedIndex.value];
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

  function handleKeyDown(e: KeyboardEvent): number {
    const listLength = filteredImages.value.length;
    if (listLength === 0) return -1;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        selectedIndex.value = Math.min(selectedIndex.value + 1, listLength - 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
        break;
      case "Enter":
        e.preventDefault();
        if (
          selectedIndex.value >= 0 &&
          filteredImages.value[selectedIndex.value]
        ) {
          return selectedIndex.value;
        }
        break;
      case "Escape":
        showSuggestions.value = false;
        selectedIndex.value = -1;
        break;
    }
    return -1;
  }

  return {
    MCR_PREFIX,
    filteredImages,
    showSuggestions,
    selectedIndex,
    suggestionItems,
    dropdownRef,
    setItemRef,
    handleKeyDown,
  };
}
