import { ref, shallowRef } from "vue";
import { createHighlighter, type Highlighter, type BundledLanguage, type SpecialLanguage } from "shiki";

// Define a custom theme that uses CSS variables to ensure it is always available in the bundle
const theme = {
  name: "css-variables-custom",
  tokenColors: [
    {
      scope: ["string", "string.quoted.double.json", "string.quoted.single.json"],
      settings: { foreground: "var(--shiki-token-string)" },
    },
    {
      scope: ["constant.numeric", "constant.language.json"],
      settings: { foreground: "var(--shiki-token-constant)" },
    },
    {
      scope: ["support.type.property-name.json"],
      settings: { foreground: "var(--shiki-token-keyword)" }, // Map key to keyword color
    },
    {
      scope: ["punctuation.definition.dictionary.begin.json", "punctuation.definition.dictionary.end.json", "punctuation.separator.dictionary.key-value.json", "punctuation.separator.dictionary.pair.json"],
      settings: { foreground: "var(--shiki-token-punctuation)" },
    },
    {
      scope: ["comment"],
      settings: { foreground: "var(--shiki-token-comment)" },
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
      langs: ["json"],
    });
    isReady.value = true;
  }

  async function highlightCode(code: string, lang: BundledLanguage | SpecialLanguage = "json") {
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
