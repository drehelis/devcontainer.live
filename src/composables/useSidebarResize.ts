import { ref, onUnmounted } from "vue";

const SIDEBAR_WIDTH_KEY = "devcontainer_sidebar_width";

export function useSidebarResize(minWidth = 250, maxWidth = 800) {
  const getInitialWidth = () => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    if (!saved) return 500;
    const parsed = parseInt(saved, 10);
    return isNaN(parsed)
      ? 500
      : Math.min(Math.max(parsed, minWidth), maxWidth);
  };

  const sidebarWidth = ref(getInitialWidth());
  const isResizing = ref(false);

  const startResizing = () => {
    isResizing.value = true;
    document.addEventListener("mousemove", doResize);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const doResize = (e: MouseEvent) => {
    if (!isResizing.value) return;
    // Activity bar is 48px (w-12)
    const newWidth = e.clientX - 48;
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebarWidth.value = newWidth;
    }
  };

  const stopResizing = () => {
    if (!isResizing.value) return;
    isResizing.value = false;
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.value.toString());
    document.removeEventListener("mousemove", doResize);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  onUnmounted(() => {
    document.removeEventListener("mousemove", doResize);
    document.removeEventListener("mouseup", stopResizing);
  });

  return {
    sidebarWidth,
    isResizing,
    startResizing,
  };
}
