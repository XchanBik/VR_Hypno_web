<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { t } from '@/utils/i18n'
import { useNavigationStore } from '@/store/navigation'
import { nav, NavigationPath } from '@/utils/navigationTree'
import { getSongs } from '@/apis/song'
import { getSessions, deleteSession } from '@/apis/session'
import { createSession } from '@/apis/session'
import type { Session } from '@shared/session/types'
import { DeleteIcon, EditIcon, MusicIcon } from '@/icons/svg'

const sessions = ref<Session[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const navStore = useNavigationStore()

// Variables pour le popup d'ajout de session
const showAddPopup = ref(false)
const newSessionName = ref('')
const newSessionSongUid = ref('')
const songs = ref<{ uid: string; info: { name: string } }[]>([])
const loadingSongs = ref(false)

async function loadSongs() {
  loadingSongs.value = true
  try {
    const result = await getSongs()
    if (result?.success) {
        songs.value = result.data?.songs || []
    }
  } catch (e) {
    console.error('Error loading songs:', e)
  } finally {
    loadingSongs.value = false
  }
}

async function loadSessions() {
  loading.value = true
  error.value = null
  try {
    const result = await getSessions()
    if (result?.success) {
      sessions.value = result.data?.sessions || []
    } else {
      error.value = result?.error || t('unknownError')
    }
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

function openEditor(uid: string) {
  navStore.navigateTo(nav.editor.sessions.edit as NavigationPath, { uid })
}

async function addSession() {
  if (!newSessionName.value.trim() || !newSessionSongUid.value) return
  try {
    const result = await createSession({
      info: {
        name: newSessionName.value.trim(),
        song_uid: newSessionSongUid.value
      }
    })
    if (result?.success) {
      showAddPopup.value = false
      newSessionName.value = ''
      newSessionSongUid.value = ''
      await loadSessions()
    } else {
      error.value = result?.error || t('unknownError')
    }
  } catch (e) {
    error.value = (e as Error).message
  }
}

function openAddPopup() {
  showAddPopup.value = true
  loadSongs()
}

async function deleteSessionUI(uid: string) {
  if (!confirm(t('confirmDeleteSession'))) return
  
  try {
    const result = await deleteSession(uid)
    if (result?.success) {
      await loadSessions()
    } else {
      error.value = result?.error || t('unknownError')
    }
  } catch (e) {
    error.value = (e as Error).message
  }
}

onMounted(loadSessions)
</script>

<template>
  <!-- Container principal brand -->
  <div class="w-full h-full">
    <!-- Header avec titre et bouton d'ajout -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-2xl">
          <span v-html="MusicIcon" class="text-white w-10 h-10 inline-flex items-center justify-center"></span>
        </div>
        <div>
          <h1 class="text-3xl font-extrabold bg-gradient-to-r from-brand-700 via-brand-500 to-brand-400 bg-clip-text text-transparent drop-shadow-brand">
            {{ t('sessions') }}
          </h1>
          <p class="text-brand-400 text-base font-semibold">{{ sessions.length }} {{ t('sessions') }}</p>
        </div>
      </div>
      <button 
        @click="openAddPopup" 
        class="bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 text-white rounded-2xl px-6 py-3 flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 text-base font-bold border-2 border-brand-200"
        :title="t('sessions')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M12 4v16m8-8H4"/>
        </svg>
        <span>{{ t('sessions') }}</span>
      </button>
    </div>

    <!-- Contenu principal -->
    <div class="flex-1">
      <div>
        <!-- États de chargement et d'erreur -->
        <div v-if="loading" class="flex items-center justify-center py-10">
          <div class="text-center">
            <div class="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-brand-400 font-bold">{{ t('loading') }}</p>
          </div>
        </div>
        <div v-else-if="error" class="bg-brand-50 border-2 border-brand-200 rounded-2xl p-6 text-center shadow-xl">
          <svg class="w-10 h-10 text-brand-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-brand-700 font-bold mb-4">{{ error }}</p>
          <button 
            @click="loadSessions" 
            class="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 mx-auto transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ t('retry') }}
          </button>
        </div>
        <div v-else>
          <!-- État vide -->
          <div v-if="sessions.length === 0" class="text-center py-10">
            <div class="w-20 h-20 bg-gradient-to-br from-brand-100 to-brand-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span v-html="MusicIcon" class="text-pink-500 w-16 h-16 mx-auto block"></span>
            </div>
            <h3 class="text-xl font-bold text-brand-700 mb-2">{{ t('sessions') }}</h3>
            <p class="text-brand-400 mb-6">{{ t('loading') }}</p>
          </div>
          <!-- Grille des sessions -->
          <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div 
              v-for="session in sessions" 
              :key="session.uid" 
              class="bg-brand-50 rounded-2xl shadow-lg px-6 py-5 mb-4 flex items-center justify-between border-2 border-brand-200"
            >
              <div class="flex flex-col flex-1 min-w-0">
                <span class="block font-extrabold text-lg text-brand-700 whitespace-normal break-words min-w-[120px]">{{ session.info.name }}</span>
              </div>
              <div class="flex gap-2">
                <button
                  @click="openEditor(session.uid)"
                  class="bg-brand-200 hover:bg-brand-300 text-brand-700 rounded-full p-2 transition shadow"
                  :title="t('edit')"
                >
                  <span v-html="EditIcon" class="w-10 h-10 inline-flex items-center justify-center"></span>
                </button>
                <button
                  @click="deleteSessionUI(session.uid)"
                  class="bg-red-200 hover:bg-red-300 text-red-700 rounded-full p-2 transition shadow"
                  :title="t('delete')"
                >
                  <span v-html="DeleteIcon" class="w-10 h-10 inline-flex items-center justify-center"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup d'ajout de session -->
    <div v-if="showAddPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 class="text-2xl font-bold text-brand-700 mb-4">Add Session</h2>
        <div class="mb-4">
          <label class="block text-sm font-bold text-brand-700 mb-2">Session Name</label>
          <input v-model="newSessionName" class="w-full px-4 py-2 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none" />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-bold text-brand-700 mb-2">Select Song</label>
          <select v-model="newSessionSongUid" class="w-full px-4 py-2 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none">
            <option value="">Select a song</option>
            <option v-for="song in songs" :key="song.uid" :value="song.uid">{{ song.info.name }}</option>
          </select>
        </div>
        <div class="flex justify-end gap-2">
          <button @click="showAddPopup = false" class="px-4 py-2 bg-brand-200 text-brand-700 rounded-lg hover:bg-brand-300 transition">Cancel</button>
          <button @click="addSession" class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>@/utils/i18n@/utils/navigationTree