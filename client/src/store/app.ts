import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    selectedPlaylistUid: null as string | null,
    selectedSessionUid: null as string | null,
    locale: 'en' as 'en' | 'fr',
  }),
  actions: {
    setPlaylist(uid: string | null) {
      this.selectedPlaylistUid = uid
    },
    setSession(uid: string | null) {
      this.selectedSessionUid = uid
    },
    setLocale(locale: 'en' | 'fr') {
      this.locale = locale
    },
  },
  persist: true,
})