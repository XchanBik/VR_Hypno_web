<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { t } from '@/i18n'
import { useNavigationStore } from '@/store/navigation'
import { nav, NavigationPath, PlaylistUidOption } from '@/navigationTree'
import type { Playlist } from '@shared/playlist/types'
import { formatDuration } from '@/utils/format'
import { getPlaylists, createPlaylist, deletePlaylist } from '@/apis/playlist'
import { DeleteIcon, EditIcon, MusicIcon } from '@/icons/svg'

const playlists = ref<Playlist[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const showCreate = ref(false)
const newPlaylistName = ref('')
const newPlaylistRepeat = ref(false)
const creating = ref(false)

const navStore = useNavigationStore()

async function loadPlaylists() {
  loading.value = true
  error.value = null
  try {
    const result = await getPlaylists()
    if (result?.success) {
      playlists.value = result.data?.playlists || []
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
  navStore.navigateTo(nav.player.playlist.edit as NavigationPath, { uid } as PlaylistUidOption)
}

async function createPlaylistUI() {
  if (!newPlaylistName.value.trim()) return
  creating.value = true
  try {
    
    const result = await createPlaylist({
      name: newPlaylistName.value.trim(),
      repeat: false,
      sessions: []
    })
    if (result?.success) {
      newPlaylistName.value = ''
      newPlaylistRepeat.value = false
      showCreate.value = false
      await loadPlaylists()
      navStore.navigateTo(nav.player.playlist.edit as NavigationPath, { uid: result.data?.playlist?.uid })
    } else {
      error.value = result?.error || t('unknownError')
    }
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    creating.value = false
  }
}

function openCreate() {
  showCreate.value = true
  newPlaylistName.value = ''
  newPlaylistRepeat.value = false
}

async function deletePlaylistUI(uid: string) {
  if (!confirm(t('confirmDeletePlaylist'))) return
  try {
    const result = await deletePlaylist(uid)
    if (result?.success) {
      await loadPlaylists()
    } else {
      error.value = result?.error || t('unknownError')
    }
  } catch (e) {
    error.value = (e as Error).message
  }
}

onMounted(loadPlaylists)
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
            {{ t('playlists') }}
          </h1>
          <p class="text-brand-400 text-base font-semibold">{{ playlists.length }} {{ playlists.length === 1 ? 'playlist' : 'playlists' }}</p>
        </div>
      </div>
      <button 
        @click="openCreate" 
        class="bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 text-white rounded-2xl px-6 py-3 flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 text-base font-bold border-2 border-brand-200"
        :title="t('addPlaylist')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M12 4v16m8-8H4"/>
        </svg>
        <span>{{ t('addPlaylist') }}</span>
      </button>
    </div>

    <!-- Contenu principal -->
    <div class="flex-1">
      <!-- Liste des playlists -->
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
            @click="loadPlaylists" 
            class="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 mx-auto transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ t('retry') }}
          </button>
        </div>
        <!-- Contenu principal -->
        <div v-else>
          <!-- Formulaire de création toujours en haut -->
          <div v-if="showCreate" class="mb-8 bg-brand-50/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border-2 border-brand-200">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-gradient-to-r from-brand-400 to-brand-600 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <h3 class="text-xl font-extrabold text-brand-700">Nouvelle playlist</h3>
            </div>
            <form @submit.prevent="createPlaylistUI" class="space-y-4">
              <div>
                <label class="block text-base font-bold text-brand-700 mb-2">Nom de la playlist</label>
                <input 
                  v-model="newPlaylistName" 
                  type="text" 
                  :placeholder="t('playlistName')" 
                  class="w-full rounded-xl px-4 py-3 border-2 border-brand-200 focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none transition-all duration-200 bg-brand-50 text-brand-700 placeholder-brand-300 font-semibold"
                  :disabled="creating"
                />
              </div>
              <div class="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  class="flex-1 bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 text-white rounded-2xl px-6 py-3 font-bold shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 border-brand-200"
                  :disabled="creating || !newPlaylistName.trim()"
                >
                  <span v-if="creating" class="flex items-center justify-center gap-2">
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création...
                  </span>
                  <span v-else>{{ t('createPlaylist') }}</span>
                </button>
                <button 
                  type="button" 
                  @click="showCreate = false" 
                  class="px-6 py-3 bg-brand-200 hover:bg-brand-300 text-brand-700 rounded-2xl font-bold transition-all duration-200 border-2 border-brand-300"
                  :disabled="creating"
                >
                  {{ t('cancel') }}
                </button>
              </div>
            </form>
          </div>
          <!-- État vide -->
          <div v-if="playlists.length === 0 && !showCreate" class="text-center py-10">
            <div class="w-20 h-20 bg-gradient-to-br from-brand-100 to-brand-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span v-html="MusicIcon" class="text-pink-500 w-16 h-16 mx-auto block"></span>
            </div>
            <h3 class="text-xl font-bold text-brand-700 mb-2">{{ t('noPlaylists') }}</h3>
            <p class="text-brand-400 mb-6">Créez votre première playlist pour commencer</p>
            <button 
              @click="openCreate" 
              class="bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 text-white rounded-2xl px-8 py-3 font-bold shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 border-2 border-brand-200"
            >
              {{ t('createPlaylist') }}
            </button>
          </div>
          <!-- Grille des playlists -->
          <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div 
              v-for="playlist in playlists" 
              :key="playlist.uid" 
              class="bg-brand-50/90 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden group border-2 border-brand-200"
            >
              <!-- Header de la carte -->
              <div class="bg-gradient-to-r from-brand-500 to-brand-700 p-4 text-white">
                <div class="flex items-center mb-1 w-full">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-extrabold text-lg truncate pr-2 tracking-wide drop-shadow-brand text-left">{{ playlist.info.name }}</h3>
                  </div>
                  <div class="flex-1 flex justify-center">
                    <span v-if="playlist.info.duration" class="flex items-center gap-1 text-sm font-bold text-white/80">
                      <svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      {{ formatDuration(playlist.info.duration) }}
                    </span>
                  </div>
                  <div class="flex items-center ml-auto gap-2">
                    <button 
                      @click="openEditor(playlist.uid)" 
                      class="bg-white/20 hover:bg-white/40 rounded-xl p-2 transition-all duration-200 border-2 border-brand-200"
                      title="Éditer"
                    >
                      <span v-html="EditIcon" class="w-10 h-10 inline-flex items-center justify-center"></span>
                    </button>
                    <button
                      @click="deletePlaylistUI(playlist.uid)"
                      class="bg-red-200 hover:bg-red-300 text-red-700 rounded-xl p-2 transition-all duration-200 border-2 border-red-400"
                      :title="t('delete')"
                    >
                      <span v-html="DeleteIcon" class="w-10 h-10 inline-flex items-center justify-center"></span>
                    </button>
                  </div>
                </div>
                <div class="flex items-center gap-2 text-sm text-white/80">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <span>{{ t('repeat') }}: {{ playlist.info.repeat ? t('yes') : t('no') }}</span>
                </div>
              </div>
              <!-- Corps de la carte -->
              <div class="p-4">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-brand-400 font-bold">
                    {{ playlist.info.sessions.length }} session{{ playlist.info.sessions.length !== 1 ? 's' : '' }}
                  </div>
                  <button 
                    @click="navStore.navigateTo(nav.player.playlist.player as NavigationPath, { uid: playlist.uid })"
                    class="bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-110 border-2 border-brand-200"
                    title="Lire"
                  >
                    <svg class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>