<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigationTree, nav, NavigationPath } from '@/utils/navigationTree'
import { useNavigationStore } from '@/store/navigation'

const navStore = useNavigationStore()
const collapsed = ref(false)

const sectionKeys = Object.keys(navigationTree.editor) as Array<keyof typeof navigationTree.editor>

const sections = computed(() =>
  sectionKeys.map(key => {
    let icon = '📁'
    if (key === 'sessions') icon = '🧠'
    if (key === 'songs') icon = '🎵'
    if (key === 'assets') icon = '💎'
    return { key, label: key.charAt(0).toUpperCase() + key.slice(1), icon }
  })
)

function selectSection(key: keyof typeof navigationTree.editor) {
  navStore.navigateTo(nav.editor[key].list as NavigationPath)
}
</script>

<template>
  <aside :class="['flex-shrink-0 h-full min-h-0 flex flex-col bg-brand-100 shadow-xl transition-all duration-300', collapsed ? 'w-15' : 'w-56']">
    <button @click="collapsed = !collapsed" class="mt-4 mb-2 ml-auto mr-2 bg-brand-200 hover:bg-brand-300 text-brand-700 rounded-full p-2 shadow transition flex items-center" :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
      <svg :class="['w-6 h-6 transition-transform']" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path v-if="collapsed" d="M9 5l7 7-7 7" />
        <path v-else d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <nav class="flex-1 flex flex-col gap-2 mt-6">
      <button v-for="section in sections" :key="section.key"
        @click="selectSection(section.key)"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-full font-bold transition-all',
          navStore.path[1] === section.key ? 'bg-brand-500 text-white shadow-lg scale-105' : 'bg-brand-200 text-brand-700 hover:bg-brand-300',
          collapsed ? 'justify-center px-2' : 'justify-start'
        ]"
        :title="section.label"
      >
        <span class="text-2xl">{{ section.icon }}</span>
        <span v-if="!collapsed" class="text-base">{{ section.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
/* brand style accent */
</style> @/utils/navigationTree