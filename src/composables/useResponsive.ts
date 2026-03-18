import { ref, onMounted, onUnmounted } from "vue";

export function useResponsive() {
  const isMobile = ref(false);

  const update = () => {
    isMobile.value = window.innerWidth < 1024; // Use 'lg' breakpoint for split layout
  };

  onMounted(() => {
    update();
    window.addEventListener("resize", update);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", update);
  });

  return {
    isMobile,
  };
}
