import { shallowRef, computed } from "vue";

export interface PaletteCommand {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  category?: string;
  action: () => void;
}

const isOpen = shallowRef(false);
const query = shallowRef("");
const activeIndex = shallowRef(0);

const _commands = shallowRef<PaletteCommand[]>([]);

function register(commands: PaletteCommand[]) {
  _commands.value = commands;
}

function open() {
  isOpen.value = true;
  query.value = "";
  activeIndex.value = 0;
}

function close() {
  isOpen.value = false;
  query.value = "";
  activeIndex.value = 0;
}

function toggle() {
  if (isOpen.value) close();
  else open();
}

const filteredCommands = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return _commands.value;
  return _commands.value.filter(
    (c) =>
      c.label.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q),
  );
});

export function useCommandPalette() {
  function moveUp() {
    const len = filteredCommands.value.length;
    if (len <= 1) return;
    activeIndex.value = (activeIndex.value - 1 + len) % len;
  }

  function moveDown() {
    const len = filteredCommands.value.length;
    if (len <= 1) return;
    activeIndex.value = (activeIndex.value + 1) % len;
  }

  function runActive() {
    const cmd = filteredCommands.value[activeIndex.value];
    if (cmd) {
      close();
      cmd.action();
    }
  }

  function runCommand(cmd: PaletteCommand) {
    close();
    cmd.action();
  }

  return {
    isOpen,
    query,
    activeIndex,
    filteredCommands,
    register,
    open,
    close,
    toggle,
    moveUp,
    moveDown,
    runActive,
    runCommand,
  };
}
