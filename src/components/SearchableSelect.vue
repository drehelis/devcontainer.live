<script setup lang="ts">
import { ref, computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options?: { value: string; label?: string }[];
    getOptions?: () => { value: string; label?: string }[];
    placeholder?: string;
    searchable?: boolean;
    freeText?: boolean;
    loading?: boolean;
  }>(),
  {
    placeholder: "Select...",
    searchable: true,
    freeText: false,
  },
);

const emit = defineEmits(["update:modelValue"]);

const showDropdown = ref(false);
const search = ref("");
const localValue = ref("");

const optionsGetter = computed(() => {
  if (props.getOptions) {
    return props.getOptions();
  }
  return props.options || [];
});

const filteredOptions = computed(() => {
  const opts = optionsGetter.value;
  if (!props.searchable || !search.value) return opts;
  const s = search.value.toLowerCase();
  return opts.filter(
    (o) =>
      o.value.toLowerCase().includes(s) || o.label?.toLowerCase().includes(s),
  );
});

function select(opt: { value: string; label?: string } | null) {
  if (opt) {
    emit("update:modelValue", opt.value);
    localValue.value = opt.value;
  } else if (props.freeText && search.value) {
    emit("update:modelValue", search.value);
    localValue.value = search.value;
  }
  showDropdown.value = false;
  search.value = "";
}

function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  localValue.value = value;
  emit("update:modelValue", value);
  search.value = value;
  if (props.freeText && (value || filteredOptions.value.length > 0)) {
    showDropdown.value = true;
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    showDropdown.value = false;
    search.value = "";
  } else if (
    e.key === "Enter" &&
    props.freeText &&
    search.value &&
    !filteredOptions.value.find((o) => o.value === search.value)
  ) {
    e.preventDefault();
    select(null);
  }
}

function isSelected(opt: { value: string; label?: string }) {
  return opt.value === props.modelValue;
}

const isLoading = computed(() => props.loading);
</script>

<template>
  <div class="relative">
    <div
      class="ide-input w-full flex items-center justify-between"
      :class="{ 'cursor-pointer': !freeText }"
    >
      <input
        v-if="freeText"
        :value="localValue || modelValue"
        @input="handleInput"
        @focus="showDropdown = true"
        @keydown="handleKeydown"
        type="text"
        class="flex-1 bg-transparent outline-none"
        :placeholder="placeholder"
      />
      <span
        v-else
        class="flex-1 cursor-pointer"
        :class="modelValue ? '' : 'opacity-50'"
        @click="showDropdown = !showDropdown"
      >
        {{
          optionsGetter.find((o) => o.value === modelValue)?.label ||
          modelValue ||
          placeholder
        }}
      </span>
      <svg
        v-if="!freeText"
        class="w-3 h-3 opacity-50 cursor-pointer"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        @click="showDropdown = !showDropdown"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
      <svg
        v-else
        class="w-3 h-3 opacity-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
    <div
      v-if="showDropdown"
      class="absolute top-full left-0 right-0 mt-1 bg-ide-sidebar/95 backdrop-blur-md border border-ide-border rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
    >
      <div v-if="searchable" class="p-2 border-b border-ide-border/50">
        <input
          v-model="search"
          class="ide-input w-full text-[10px] py-1"
          placeholder="Search..."
          @click.stop
          autofocus
        />
      </div>
      <div
        v-if="isLoading"
        class="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-ide-accent animate-pulse"
      >
        Loading...
      </div>
      <template v-else>
        <div
          v-for="opt in filteredOptions"
          :key="opt.value"
          @mousedown.prevent="select(opt)"
          class="px-4 py-2 text-[10px] cursor-pointer border-b border-ide-border/30 last:border-none transition-colors flex justify-between items-center"
          :class="
            isSelected(opt)
              ? 'bg-ide-accent/30 text-ide-accent'
              : 'hover:bg-ide-accent/10 hover:text-ide-accent'
          "
        >
          <span>{{ opt.label || opt.value }}</span>
          <svg
            v-if="isSelected(opt)"
            class="w-3 h-3 text-ide-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div
          v-if="filteredOptions.length === 0"
          class="px-4 py-3 text-[10px] text-ide-text-muted"
        >
          No options found
        </div>
      </template>
    </div>
    <div
      v-if="showDropdown"
      class="fixed inset-0 z-40"
      @click="
        showDropdown = false;
        search = '';
      "
    />
  </div>
</template>
