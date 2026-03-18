<script setup lang="ts">
defineProps<{
  modelValue: number | string | undefined;
  placeholder?: string;
  min?: number;
  max?: number;
}>();

const emit = defineEmits(["update:modelValue"]);

function increment(val: number | string | undefined, step: number) {
  const current = Number(val) || 0;
  emit("update:modelValue", Math.max(0, current + step));
}

function handleInput(e: Event) {
  const val = (e.target as HTMLInputElement).value;
  if (val === "") {
    emit("update:modelValue", "");
    return;
  }
  emit("update:modelValue", Math.max(0, Number(val)));
}
</script>

<template>
  <div class="relative group/stepper">
    <input
      type="number"
      :value="modelValue"
      @input="handleInput"
      :placeholder="placeholder"
      :min="min"
      :max="max"
      class="ide-input w-full pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
    <div
      class="absolute right-px top-px bottom-px w-6 flex flex-col border-l border-ide-border bg-ide-activity/50 rounded-r overflow-hidden"
    >
      <button
        @click="increment(modelValue, 1)"
        class="flex-1 flex items-center justify-center hover:bg-ide-accent hover:text-ide-bg transition-colors border-b border-ide-border"
        tabindex="-1"
      >
        <svg class="w-1.5 h-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="5" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button
        @click="increment(modelValue, -1)"
        class="flex-1 flex items-center justify-center hover:bg-ide-accent hover:text-ide-bg transition-colors"
        tabindex="-1"
      >
        <svg class="w-1.5 h-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  </div>
</template>
