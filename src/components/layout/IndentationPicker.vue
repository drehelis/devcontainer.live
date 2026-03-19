<script setup lang="ts">
defineProps<{
  modelValue: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: number): void;
  (e: "close"): void;
}>();

const indentOptions = [
  { id: "4", name: "Spaces", value: 4 },
  { id: "tabs", name: "Tabs", value: -1 },
];

function selectOption(val: number) {
  emit("update:modelValue", val);
  emit("close");
}
</script>

<template>
  <div
    class="absolute bottom-full right-0 mb-2 w-32 bg-ide-sidebar border border-ide-border rounded-lg shadow-2xl z-[100] overflow-hidden"
  >
    <div
      v-for="opt in indentOptions"
      :key="opt.id"
      @click="selectOption(opt.value)"
      class="px-4 py-2 hover:bg-ide-accent/10 hover:text-ide-accent cursor-pointer transition-colors flex items-center justify-between"
      :class="{
        'bg-ide-accent/5 text-ide-accent font-black': modelValue === opt.value,
      }"
    >
      <span class="text-[10px] uppercase font-bold tracking-tight">{{
        opt.name
      }}</span>
      <svg
        v-if="modelValue === opt.value"
        class="w-3 h-3 text-ide-accent"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="4"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  </div>
</template>
