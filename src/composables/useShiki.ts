import { ref, shallowRef } from "vue";
import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
  type SpecialLanguage,
} from "shiki";

// Define a custom theme that uses CSS variables to ensure it is always available in the bundle
const theme = {
  name: "css-variables-custom",
  tokenColors: [
    {
      scope: ["string", "string.quoted"],
      settings: { foreground: "var(--shiki-token-string)" },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "constant.other",
      ],
      settings: { foreground: "var(--shiki-token-constant)" },
    },
    {
      scope: [
        "keyword",
        "storage.type",
        "storage.modifier",
        "support.type.property-name",
      ],
      settings: { foreground: "var(--shiki-token-keyword)" },
    },
    {
      scope: ["punctuation", "meta.brace", "punctuation.definition.parameters"],
      settings: { foreground: "var(--shiki-token-punctuation)" },
    },
    {
      scope: ["comment"],
      settings: { foreground: "var(--shiki-token-comment)" },
    },
    {
      scope: ["entity.name.function", "support.function", "variable.function"],
      settings: { foreground: "var(--shiki-token-function)" },
    },
    {
      scope: ["variable.parameter", "support.variable"],
      settings: { foreground: "var(--shiki-token-parameter)" },
    },
  ],
};

export function useShiki() {
  const highlighter = shallowRef<Highlighter | null>(null);
  const isReady = ref(false);

  async function init() {
    if (highlighter.value) return;
    highlighter.value = await createHighlighter({
      themes: [theme],
      langs: ["json", "dockerfile", "yaml", "shell"],
    });
    isReady.value = true;
  }

  async function highlightCode(
    code: string,
    lang: BundledLanguage | SpecialLanguage = "json",
  ) {
    if (!highlighter.value) await init();
    if (!highlighter.value) return [];

    const result = await highlighter.value.codeToTokens(code, {
      lang,
      theme: theme,
    });
    return result.tokens;
  }

  return {
    isReady,
    init,
    highlightCode,
  };
}
