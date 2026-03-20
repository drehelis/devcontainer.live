<script setup lang="ts">
type Section =
  | "general"
  | "features"
  | "ports"
  | "history"
  | "advanced"
  | "presets";

defineProps<{
  activeSection: Section;
}>();

defineEmits<{
  (e: "update:activeSection", section: Section): void;
}>();
</script>

<template>
  <aside
    class="w-12 bg-ide-activity border-r border-ide-border flex flex-col items-center py-4 gap-2 z-20"
  >
    <div
      @click="$emit('update:activeSection', 'presets')"
      class="activity-item group"
      :class="{ active: activeSection === 'presets' }"
      title="Presets (Quick Start)"
    >
      <svg
        class="w-6 h-6"
        :class="
          activeSection === 'presets'
            ? 'text-ide-text-bright'
            : 'text-ide-text-muted group-hover:text-ide-text'
        "
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    </div>

    <div
      @click="$emit('update:activeSection', 'general')"
      class="activity-item group"
      :class="{ active: activeSection === 'general' }"
      title="General Settings"
    >
      <svg
        class="w-6 h-6"
        :class="
          activeSection === 'general'
            ? 'text-ide-text-bright'
            : 'text-ide-text-muted group-hover:text-ide-text'
        "
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </div>
    <div
      @click="$emit('update:activeSection', 'features')"
      class="activity-item group"
      :class="{ active: activeSection === 'features' }"
      title="Features"
    >
      <svg
        class="w-6 h-6"
        :class="
          activeSection === 'features'
            ? 'text-ide-text-bright'
            : 'text-ide-text-muted group-hover:text-ide-text'
        "
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
        />
      </svg>
    </div>
    <div
      @click="$emit('update:activeSection', 'ports')"
      class="activity-item group"
      :class="{ active: activeSection === 'ports' }"
      title="Network & Ports"
    >
      <svg
        class="w-6 h-6"
        :class="
          activeSection === 'ports'
            ? 'text-ide-text-bright'
            : 'text-ide-text-muted group-hover:text-ide-text'
        "
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.963 11.963 0 0112 10.5a11.963 11.963 0 01-7.843-2.918m15.686 0A8.996 8.996 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    </div>
    <div
      @click="$emit('update:activeSection', 'history')"
      class="activity-item group"
      :class="{ active: activeSection === 'history' }"
      title="Mounts"
    >
      <svg
        class="w-6 h-6"
        :class="
          activeSection === 'history'
            ? 'text-ide-text-bright'
            : 'text-ide-text-muted group-hover:text-ide-text'
        "
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>
    </div>
    <div
      @click="$emit('update:activeSection', 'advanced')"
      class="activity-item group"
      :class="{ active: activeSection === 'advanced' }"
      title="Advanced & Hooks"
    >
      <svg
        class="w-6 h-6"
        :class="
          activeSection === 'advanced'
            ? 'text-ide-text-bright'
            : 'text-ide-text-muted group-hover:text-ide-text'
        "
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    </div>
  </aside>
</template>
