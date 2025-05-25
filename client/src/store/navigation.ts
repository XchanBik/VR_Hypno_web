import { defineStore } from 'pinia'
import type { NavigationPath } from '@/navigationTree'
import { nav } from '@/navigationTree'

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    path: nav.player.playlist.list as NavigationPath,
    options: {} as any,
  }),
  actions: {
    navigateTo(path: NavigationPath, options?: any) {
      this.path = [...path] as NavigationPath
      this.options = options ?? {}
    }
  }
}) 