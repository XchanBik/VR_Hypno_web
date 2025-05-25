<script setup lang="ts">
import { nextTick, ref, onMounted } from 'vue'
import { t } from '@/i18n'
import { useNavigationStore } from '@/store/navigation'
import { nav, NavigationPath } from '@/navigationTree'
import ThreeJSManager from '@/vr/three/ThreeJSManager'
import type { PlaylistInfo } from '@shared/playlist/types'
import type { SessionInfo } from '@shared/session/types'
import type { SongInfo } from '@shared/song/types'
import { getPlaylist } from '@/apis/playlist'
import { getSong } from '@/apis/song'
import { getSession } from '@/apis/session'

const navStore = useNavigationStore()
const uid = navStore.options.uid as string

const loading = ref(true)
const error = ref<string | null>(null)
const playlist = ref<PlaylistInfo | null>(null)
const sessions = ref<SessionInfo[]>([])
const songs = ref<SongInfo[]>([])
const threeManager = ref<InstanceType<typeof ThreeJSManager> | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isInVR = ref(false)

async function loadAllData() {
  loading.value = true
  error.value = null
  try {
    const playlistResult = await getPlaylist(uid)
    if (!playlistResult?.success || !playlistResult.data.playlist || !playlistResult.data.playlist.info.sessions) {
      throw new Error(playlistResult?.error || 'Playlist not found or missing sessions')
    }
    playlist.value = playlistResult.data.playlist.info as PlaylistInfo
    // Load all sessions
    const sessionResults = await Promise.all(
      playlist.value!.sessions.map((sid: string) => getSession(sid))
    )
    sessions.value = sessionResults.map(r => r.data.session.info as SessionInfo)
    // Load all songs
    const songUids: string[] = []
    for (const s of sessions.value) {
      if (!songUids.includes(s.song_uid)) {
        songUids.push(s.song_uid)
      }
    }
    const songResults = await Promise.all(
      songUids.map((sid: string) => getSong(sid))
    )
    songs.value = songResults.map(r => r.data.song.info as SongInfo)
    loading.value = false
  } catch (e) {
    error.value = (e as Error).message
    loading.value = false
  }
  console.log('loadAllData END')
}

async function onStartVR() {
  if (threeManager.value) {
    try {
      await threeManager.value.enterVR()
      isInVR.value = true
    } catch (e) {
      isInVR.value = false
      alert('Could not start VR: ' + (e as Error).message)
    }
  }
}

onMounted(async () => {
  await loadAllData()
  if (!error.value) {
    await nextTick() // S'assure que le DOM est prêt
    if (canvasRef.value) {
      threeManager.value = new ThreeJSManager({
        canvas: canvasRef.value,
        playlist: playlist.value,
        sessions: sessions.value,
        songs: songs.value,
        vr: true // or from flag
      })
      threeManager.value.init()
    }
  }
})
</script>

<template>
  <div class="bg-brand-50 rounded-xl p-6 pt-16 shadow-lg flex flex-col items-center justify-center relative h-full">
    <button @click="navStore.navigateTo(nav.player.playlist.list as NavigationPath)" class="absolute top-4 left-4 bg-brand-200 hover:bg-brand-300 text-brand-700 rounded-full px-4 py-2 font-bold shadow transition flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      {{ t('back') }}
    </button>
    <div v-if="loading" class="text-center py-8 text-brand-400">{{ t('loading') }}</div>
    <div v-else-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
    <div v-else class="w-full h-full flex flex-col items-center justify-center">
      <button v-if="!isInVR" @click="onStartVR" class="bg-brand-500 text-white rounded-full px-8 py-4 text-2xl font-bold shadow-lg hover:bg-brand-600 transition mb-8">Start VR</button>
      <canvas v-show="isInVR" ref="canvasRef" class="w-full h-full bg-black rounded-xl" />
    </div>
  </div>
</template> 