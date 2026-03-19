import { ref, computed, watch } from "vue";
import { THEMES, DEFAULT_THEME_ID } from "../constants/themes";
import { STORAGE_KEYS } from "../constants/storage";

const currentThemeId = ref(
  localStorage.getItem(STORAGE_KEYS.THEME) || DEFAULT_THEME_ID,
);
const showThemeMenu = ref(false);

const currentTheme = computed(
  () => THEMES.find((t) => t.id === currentThemeId.value) || THEMES[0],
);

export function useTheme() {
  function setTheme(id: string) {
    currentThemeId.value = id;
    showThemeMenu.value = false;
  }

  watch(
    currentTheme,
    (newTheme) => {
      if (!newTheme) return;

      localStorage.setItem(STORAGE_KEYS.THEME, newTheme.id);

      // Remove all theme classes
      THEMES.forEach((t) => {
        if (t.class) document.documentElement.classList.remove(t.class);
      });

      // Add new theme class
      if (newTheme.class)
        document.documentElement.classList.add(newTheme.class);
    },
    { immediate: true },
  );

  return {
    themes: THEMES,
    currentThemeId,
    currentTheme,
    showThemeMenu,
    setTheme,
  };
}
