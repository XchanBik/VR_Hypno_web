<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { t } from '@/i18n'
import { useNavigationStore } from '@/store/navigation'
import type { PlaylistInfo } from '@/types/playlist'
import type { Session } from '@/types/session'
import type { Song } from '@/types/song'
import { nav, NavigationPath } from '@/navigationTree'
import { formatDuration } from '@/utils/format'

const navStore = useNavigationStore()
const uid = computed(() => navStore.options.uid as string)

const loading = ref(true)
const error = ref<string | null>(null)
const info = ref<PlaylistInfo | null>(null)
const saving = ref(false)
const saveError = ref<string | null>(null)

// Variables pour le popup d'ajout de session
const showAddPopup = ref(false)
const sessions = ref<{ uid: string; info: { name: string } }[]>([])
const loadingSessions = ref(false)
const selectedSession = ref('')
const allSessions = ref<Session[]>([])
const allSongs = ref<Song[]>([])

async function loadSessionsAndSongs() {
  loadingSessions.value = true
  try {
    // @ts-ignore
    const [sessionResult, songResult] = await Promise.all([
      window.electronAPI?.getSessions?.(),
      window.electronAPI?.getSongs?.()
    ])
    if (sessionResult?.success) {
      allSessions.value = sessionResult.sessions || []
    }
    if (songResult?.success) {
      allSongs.value = songResult.songs || []
    }
  } catch (e) {
    console.error('Error loading sessions or songs:', e)
  } finally {
    loadingSessions.value = false
  }
}

function getSessionByUid(uid: string) {
  return allSessions.value.find(s => s.uid === uid)
}
function getSongByUid(uid: string) {
  return allSongs.value.find(s => s.uid === uid)
}
function getSessionName(uid: string) {
  return getSessionByUid(uid)?.info.name || uid
}
function getSessionDuration(uid: string) {
  const session = getSessionByUid(uid)
  if (!session) return null
  const song = getSongByUid(session.info.song_uid)
  return song?.info.duration ?? null
}

async function load() {
  if (!uid.value) return
  loading.value = true
  error.value = null
  try {
    // @ts-ignore
    const result = await window.electronAPI?.getPlaylist?.(uid.value)
    if (result?.success) {
      info.value = result.playlist
    } else {
      error.value = result?.error || t('unknownError')
    }
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!info.value || !uid.value) return
  saving.value = true
  saveError.value = null
  try {
    // Compute total duration
    let total = 0
    for (const sessionUid of info.value.sessions) {
      const session = getSessionByUid(sessionUid)
      if (session) {
        const song = getSongByUid(session.info.song_uid)
        if (song && typeof song.info.duration === 'number') {
          total += song.info.duration
        }
      }
    }
    info.value.duration = total
    const payload = {
      uid: uid.value,
      info: JSON.parse(JSON.stringify(info.value))
    }
    const result = await window.electronAPI?.updatePlaylist?.(payload)
    // @ts-ignore
    if (result?.success) {
      navStore.navigateTo(nav.player.playlist.list as NavigationPath)
    } else {
      saveError.value = result?.error || t('unknownError')
    }
  } catch (e) {
    saveError.value = (e as Error).message
  } finally {
    saving.value = false
  }
}

function openAddPopup() {
  showAddPopup.value = true
  loadSessionsAndSongs()
}

function addSession(sessionUid: string) {
  if (!info.value) return
  info.value.sessions.push(sessionUid)
  showAddPopup.value = false
}

function removeSession(index: number) {
  if (!info.value) return
  info.value.sessions.splice(index, 1)
}

// Drag and drop logic
const dragIndex = ref<number | null>(null)
function onDragStart(idx: number) {
  dragIndex.value = idx
}
function onDrop(idx: number) {
  if (!info.value || dragIndex.value === null || dragIndex.value === idx) return
  const arr = info.value.sessions
  const [moved] = arr.splice(dragIndex.value, 1)
  arr.splice(idx, 0, moved)
  dragIndex.value = null
}
function onDragEnd() {
  dragIndex.value = null
}

onMounted(() => {
  load()
  loadSessionsAndSongs()
})
watch(uid, () => {
  load()
  loadSessionsAndSongs()
})
</script>

<template>
  <div class="bg-brand-50 rounded-xl p-6 pt-16 shadow-lg relative">
    <div class="absolute top-4 right-4 text-xs text-brand-300 font-mono opacity-70 select-all z-10">
      UID: {{ uid }}
    </div>
    <button @click="navStore.navigateTo(nav.player.playlist.list as NavigationPath)" class="absolute top-4 left-4 bg-brand-200 hover:bg-brand-300 text-brand-700 rounded-full px-4 py-2 font-bold shadow transition flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      Back
    </button>
    <div v-if="loading" class="text-center py-8 text-brand-400">{{ t('loading') }}</div>
    <div v-else-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
    <div v-else-if="info">
      <div class="mb-4">
        <label class="block mb-2 font-bold text-brand-700">{{ t('playlistName') }}
          <input v-model="info.name" class="rounded-full px-4 py-2 border border-brand-200 focus:ring-2 focus:ring-brand-400 outline-none w-full mt-1" />
        </label>
        <label class="flex items-center gap-2 mb-2">
          <input v-model="info.repeat" type="checkbox" class="accent-brand-500" />
          {{ t('repeat') }}
        </label>
      </div>
      <div class="mb-4">
        <div class="font-bold text-brand-700 mb-2">{{ t('sessions') }}</div>
        <ul class="space-y-2">
          <li v-for="(sessionUid, idx) in info.sessions" :key="idx" draggable="true"
              @dragstart="onDragStart(idx)" @dragover.prevent @drop="onDrop(idx)" @dragend="onDragEnd"
              class="flex items-center gap-3 bg-brand-100 rounded-lg px-3 py-2 shadow-sm cursor-move">
            <span class="font-bold text-brand-400 w-6 text-right">{{ (idx+1).toString().padStart(2, '0') }}</span>
            <span class="flex-1 font-semibold text-brand-700 truncate">{{ getSessionName(sessionUid) }}</span>
            <span class="text-xs text-brand-400 w-12 text-right">{{ formatDuration(getSessionDuration(sessionUid)) }}</span>
            <button @click="removeSession(idx)" class="text-red-500 hover:text-red-700 ml-2">Remove</button>
          </li>
        </ul>
        <button @click="openAddPopup" class="mt-2 bg-brand-200 hover:bg-brand-300 text-brand-700 rounded-full px-4 py-2 font-bold shadow transition">Add Session</button>
      </div>
      <div v-if="saveError" class="text-center text-red-500 mb-2">{{ saveError }}</div>
      <div class="flex gap-2 mt-4">
        <button @click="save" :disabled="saving" class="btn rounded-full px-6 py-2 shadow bg-brand-500 text-white hover:bg-brand-600 transition font-bold tracking-wide uppercase">{{ t('save') }}</button>
        <button @click="navStore.navigateTo(nav.player.playlist.list as NavigationPath)" class="btn rounded-full px-6 py-2 shadow bg-brand-200 text-brand-700 hover:bg-brand-300 transition font-bold tracking-wide uppercase">{{ t('cancel') }}</button>
      </div>
    </div>

    <!-- Popup d'ajout de session -->
    <div v-if="showAddPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 class="text-2xl font-bold text-brand-700 mb-4">Add Session</h2>
        <div class="mb-4">
          <label class="block text-sm font-bold text-brand-700 mb-2">Select Session</label>
          <select v-model="selectedSession" class="w-full px-4 py-2 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none">
            <option value="">Select a session</option>
            <option v-for="session in allSessions" :key="session.uid" :value="session.uid">{{ session.info.name }}</option>
          </select>
        </div>
        <div class="flex justify-end gap-2">
          <button @click="showAddPopup = false" class="px-4 py-2 bg-brand-200 text-brand-700 rounded-lg hover:bg-brand-300 transition">Cancel</button>
          <button @click="addSession(selectedSession)" class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition">Add</button>
        </div>
      </div>
    </div>
  </div>
</template> 