<script setup lang="ts">
import { t } from '../utils/i18n'
import { useAppStore } from '../store/app'
import { useNavigationStore } from '@/store/navigation'
import { nav, NavigationPath } from '@/utils/navigationTree'
const appStore = useAppStore()
const navStore = useNavigationStore()
</script>

<template>
  <header class="fixed top-0 left-0 w-full bg-gradient-to-r from-brand-400 via-brand-200 to-brand-400 shadow-md z-10 border-b border-brand-200">
    <div class="max-w mx-auto px-2">
      <div class="flex justify-between items-center h-20">
        <div class="flex items-center space-x-4">
          <span class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-500 shadow-lg">
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21s-6.5-4.35-9-7.5C-1.5 8.5 2.5 3.5 7 6.5c2.1 1.4 3 2.5 5 5 2-2.5 2.9-3.6 5-5C21.5 3.5 25.5 8.5 21 13.5c-2.5 3.15-9 7.5-9 7.5z" />
            </svg>
          </span>
          <button 
            @click="navStore.navigateTo(nav.player.playlist.list as NavigationPath)"
            :class="[
              'btn',
              'rounded-full',
              'bg-brand-500',
              'text-white',
              navStore.path[0] === 'player' ? 'ring-2 ring-brand-300 scale-105' : 'bg-brand-200 text-brand-700',
              'hover:bg-brand-600',
              'transition-all duration-150',
              'text-base px-6 py-2 shadow-lg font-bold tracking-wide uppercase'
            ]"
          >
            {{ t('player') }}
          </button>
          <button 
            :disabled="navStore.path[0] === 'editor'"
            @click="navStore.path[0] === 'editor' ? null : navStore.navigateTo(nav.editor.sessions.list as NavigationPath)"
            :class="[
              'btn',
              'rounded-full',
              'bg-brand-500',
              'text-white',
              navStore.path[0] === 'editor' ? 'ring-2 ring-brand-300 scale-105 opacity-60 cursor-default' : 'bg-brand-200 text-brand-700',
              'hover:bg-brand-600',
              'transition-all duration-150',
              'text-base px-6 py-2 shadow-lg font-bold tracking-wide uppercase'
            ]"
          >
          {{ t('editor') }}
          </button>
        </div>
        <div class="flex items-center space-x-2 ml-4">
          <button @click="appStore.setLocale('en')" :class="[appStore.locale === 'en' ? 'ring-2 ring-brand-400' : '', 'rounded-full p-1 transition']" title="English">
            <img src="/public/flag-gb.svg" alt="GB" class="w-7 h-5 rounded shadow-sm" />
          </button>
          <button @click="appStore.setLocale('fr')" :class="[appStore.locale === 'fr' ? 'ring-2 ring-brand-400' : '', 'rounded-full p-1 transition']" title="Français">
            <img src="/public/flag-fr.svg" alt="FR" class="w-7 h-5 rounded shadow-sm" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template> ../utils/i18n@/utils/navigationTree