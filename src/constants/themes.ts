import type { Theme } from "../types";

export const THEMES: Theme[] = [
  { id: "midnight", name: "Midnight", class: "" },
  { id: "dracula", name: "Dracula", class: "theme-dracula" },
  { id: "nord", name: "Nord", class: "theme-nord" },
  { id: "solarized", name: "Solarized Light", class: "theme-solarized-light" },
];

export const DEFAULT_THEME_ID = THEMES[0].id;
