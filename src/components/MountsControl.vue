<script setup lang="ts">
import { ref } from "vue";
import SearchableSelect from "./SearchableSelect.vue";

const props = defineProps<{
  mounts: (
    | string
    | {
        source: string;
        target: string;
        type: "bind" | "volume";
        [key: string]: any;
      }
  )[];
}>();

const emit = defineEmits(["update:mounts"]);

const MOUNT_TYPES = [
  { value: "bind", label: "Bind" },
  { value: "volume", label: "Volume" },
];

const newMount = ref({
  source: "",
  target: "",
  type: "bind" as "bind" | "volume",
  options: "",
  readonly: false,
});

const editingIndex = ref<number | null>(null);

function addMount() {
  if (!newMount.value.source || !newMount.value.target) return;

  const mount = {
    source: newMount.value.source,
    target: newMount.value.target,
    type: newMount.value.type,
    ...(newMount.value.options ? { options: newMount.value.options } : {}),
    ...(newMount.value.readonly ? { readonly: true } : {}),
  };

  const updatedMounts = [...props.mounts];
  if (editingIndex.value !== null) {
    updatedMounts[editingIndex.value] = mount;
    editingIndex.value = null;
  } else {
    updatedMounts.push(mount);
  }

  emit("update:mounts", updatedMounts);

  newMount.value = {
    source: "",
    target: "",
    type: "bind",
    options: "",
    readonly: false,
  };
}

function removeMount(index: number, event?: Event) {
  if (event) event.stopPropagation();
  const updated = [...props.mounts];
  updated.splice(index, 1);
  if (editingIndex.value === index) editingIndex.value = null;
  else if (editingIndex.value !== null && editingIndex.value > index)
    editingIndex.value--;
  emit("update:mounts", updated.length > 0 ? updated : undefined);
}

function selectMountToEdit(mount: any, index: number) {
  editingIndex.value = index;
  if (typeof mount === "string") {
    const parts = mount.split(",");
    const sourcePart = parts.find((p) => p.startsWith("source="));
    const targetPart = parts.find((p) => p.startsWith("target="));
    const typePart = parts.find((p) => p.startsWith("type="));
    const isRO = parts.includes("readonly");

    const rawType = typePart ? typePart.split("=")[1] : "bind";
    const type = ["bind", "volume"].includes(rawType)
      ? (rawType as "bind" | "volume")
      : ("bind" as const);

    newMount.value = {
      source: sourcePart ? sourcePart.split("=")[1] : "",
      target: targetPart ? targetPart.split("=")[1] : "",
      type,
      options: parts
        .filter((p) => {
          const [k] = p.split("=");
          return !["source", "target", "type", "readonly"].includes(k);
        })
        .join(","),
      readonly: isRO,
    };
  } else {
    const rawType = (mount as any).type || "bind";
    const type = ["bind", "volume"].includes(rawType)
      ? (rawType as "bind" | "volume")
      : ("bind" as const);

    newMount.value = {
      source: mount.source,
      target: mount.target,
      type,
      options: mount.options || "",
      readonly: !!mount.readonly,
    };
  }
}

function getMountLabel(mount: any) {
  if (typeof mount !== "string") return `${mount.source} ➔ ${mount.target}`;

  const parts = mount.split(",");
  const sourcePart = parts.find((p) => p.startsWith("source="));
  const targetPart = parts.find((p) => p.startsWith("target="));

  if (sourcePart && targetPart) {
    return `${sourcePart.split("=")[1]} ➔ ${targetPart.split("=")[1]}`;
  }
  return mount;
}

function getMountType(mount: any) {
  if (typeof mount !== "string") return mount.type;
  const typePart = mount.split(",").find((p) => p.startsWith("type="));
  return typePart ? typePart.split("=")[1] : "RAW";
}

function isReadonly(mount: any) {
  if (typeof mount !== "string") return !!mount.readonly;
  return mount.split(",").includes("readonly");
}
</script>

<template>
  <div class="space-y-4">
    <div
      class="grid grid-cols-2 lg:grid-cols-[1fr_1fr_80px_auto_auto] gap-2 p-3 bg-ide-activity border border-ide-border rounded-lg"
    >
      <div class="space-y-1 col-span-2 lg:col-span-1">
        <label class="text-[8px] font-black uppercase opacity-50">Source</label>
        <input
          v-model="newMount.source"
          type="text"
          placeholder="${localWorkspaceFolder}"
          class="ide-input w-full py-1 text-[10px]"
        />
      </div>
      <div class="space-y-1 col-span-2 lg:col-span-1">
        <label class="text-[8px] font-black uppercase opacity-50">Target</label>
        <input
          v-model="newMount.target"
          type="text"
          placeholder="/workspace"
          class="ide-input w-full py-1 text-[10px]"
        />
      </div>
      <div class="space-y-1 col-span-1 lg:col-span-1">
        <label class="text-[8px] font-black uppercase opacity-50">Type</label>
        <SearchableSelect v-model="newMount.type" :options="MOUNT_TYPES" />
      </div>
      <div
        class="space-y-1 flex flex-col justify-end pb-1.5 col-span-1 lg:col-span-1"
      >
        <label class="flex items-center gap-2 cursor-pointer group/ro">
          <input type="checkbox" v-model="newMount.readonly" class="hidden" />
          <div
            class="w-3.5 h-3.5 border border-ide-border rounded-sm flex items-center justify-center transition-colors group-hover/ro:border-ide-accent"
            :class="{ 'bg-ide-accent border-ide-accent': newMount.readonly }"
          >
            <svg
              v-if="newMount.readonly"
              class="w-2.5 h-2.5 text-ide-bg"
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
          <span class="text-[8px] font-black uppercase opacity-50">RO</span>
        </label>
      </div>
      <div class="flex items-end col-span-2 lg:col-span-1">
        <button
          @click="addMount"
          class="text-ide-bg px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-ide-accent/10 h-[28px] w-full"
          :class="
            editingIndex !== null
              ? 'bg-ide-orange shadow-ide-orange/10'
              : 'bg-ide-accent'
          "
        >
          {{ editingIndex !== null ? "Update" : "Add" }}
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <div
        v-for="(mount, index) in mounts"
        :key="index"
        role="button"
        tabindex="0"
        aria-label="Select mount to edit"
        @click="selectMountToEdit(mount, index)"
        @keydown.enter.space.prevent="selectMountToEdit(mount, index)"
        class="flex items-center justify-between p-2 pl-3 bg-ide-activity/30 border border-ide-border/50 rounded group hover:border-ide-accent/30 transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ide-accent"
        :class="{
          'border-ide-accent/60 bg-ide-accent/5 ring-1 ring-ide-accent/20':
            editingIndex === index,
        }"
      >
        <div class="flex flex-col gap-0.5">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono text-ide-text-bright">{{
              getMountLabel(mount)
            }}</span>
            <span
              v-if="isReadonly(mount)"
              class="px-1 py-0.5 bg-ide-orange/20 text-ide-orange text-[6px] font-black rounded-sm uppercase tracking-tighter"
              >Read Only</span
            >
          </div>
          <div
            class="flex gap-2 items-center opacity-40 group-hover:opacity-70 transition-opacity"
          >
            <span
              class="text-[7px] font-black uppercase tracking-widest bg-ide-border px-1 rounded-sm"
              >{{ getMountType(mount) }}</span
            >
            <span
              v-if="typeof mount !== 'string' && mount.options"
              class="text-[7px] font-mono"
              >{{ mount.options }}</span
            >
          </div>
        </div>
        <button
          @click="removeMount(index, $event)"
          class="p-1.5 text-ide-text-muted hover:text-ide-orange transition-colors"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
