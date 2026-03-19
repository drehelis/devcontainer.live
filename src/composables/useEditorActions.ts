import { ref, type Ref } from "vue";
import JSZip from "jszip";

export function useEditorActions(
  allFiles: Ref<Record<string, { content: string; language: string }>>,
  activeFile: Ref<string>,
  reset: () => void,
  getShareUrl: () => string,
) {
  const copyStatus = ref<"idle" | "copied">("idle");
  const shareStatus = ref<"idle" | "copied">("idle");
  const showIndentMenu = ref(false);

  async function copyToClipboard() {
    try {
      const content = allFiles.value[activeFile.value]?.content || "";
      await navigator.clipboard.writeText(content);
      copyStatus.value = "copied";
      setTimeout(() => {
        copyStatus.value = "idle";
      }, 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      shareStatus.value = "copied";
      setTimeout(() => {
        shareStatus.value = "idle";
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link!", err);
    }
  }

  async function downloadConfig() {
    const files = allFiles.value;
    const fileKeys = Object.keys(files);

    if (fileKeys.length === 1) {
      // Single file download (as before)
      const fileName = fileKeys[0];
      const blob = new Blob([files[fileName].content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Multiple files - ZIP them
      const zip = new JSZip();

      // Create a .devcontainer folder and put everything in it
      const folder = zip.folder(".devcontainer");
      if (folder) {
        fileKeys.forEach((name) => {
          folder.file(name, files[name].content);
        });

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "devcontainer-config.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  }

  return {
    copyStatus,
    shareStatus,
    showIndentMenu,
    copyToClipboard,
    copyShareLink,
    downloadConfig,
    reset,
  };
}
