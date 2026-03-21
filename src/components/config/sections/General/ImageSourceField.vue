<script setup lang="ts">
import { toRef } from "vue";
import { useImageAutocomplete } from "../../../../composables/useImageAutocomplete";
import InfoTooltip from "../../../InfoTooltip.vue";

const props = defineProps<{
  image?: string;
}>();

const emit = defineEmits<{
  (e: "update:image", val: string): void;
}>();

const imageRef = toRef(props, "image");

const autocomplete = useImageAutocomplete(imageRef, (img) => {
  emit("update:image", img);
});

const {
  filteredImages,
  showImageSuggestions,
  selectedIndex,
  dropdownRef,
  setItemRef,
  selectImage,
  handleKeyDown,
} = autocomplete;

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
dropdownRef;
</script>

<template>
  <div class="pt-4 space-y-3 animate-in fade-in duration-300">
    <div class="flex items-center gap-1.5">
      <label
        class="text-[9px] font-black uppercase tracking-widest text-ide-text-muted"
        >Image Source</label
      >
      <InfoTooltip property="image" />
    </div>
    <div class="relative">
      <input
        :value="image"
        @input="
          $emit('update:image', ($event.target as HTMLInputElement).value)
        "
        @focus="showImageSuggestions = true"
        @blur="showImageSuggestions = false"
        @keydown="handleKeyDown"
        type="text"
        class="ide-input w-full font-mono"
        placeholder="mcr.microsoft.com/devcontainers/..."
      />
      <div
        v-if="showImageSuggestions && filteredImages.length > 0"
        ref="dropdownRef"
        class="absolute top-full left-0 right-0 mt-1 bg-ide-sidebar/95 backdrop-blur-md border border-ide-border rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar transition-all"
      >
        <div
          v-for="(img, i) in filteredImages"
          :key="img"
          :ref="(el) => setItemRef(el, i)"
          @mousedown.prevent="selectImage(img)"
          class="px-4 py-2 text-[10px] font-mono cursor-pointer border-b border-ide-border/50 last:border-none transition-colors flex justify-between items-center"
          :class="
            i === selectedIndex
              ? 'bg-ide-accent/30 text-ide-accent'
              : 'hover:bg-ide-accent/10 hover:text-ide-accent'
          "
        >
          <span>{{ img }}</span>
          <span
            v-if="img.includes(':')"
            class="text-[7px] opacity-50 px-1 border border-ide-border rounded"
            >TAG</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
