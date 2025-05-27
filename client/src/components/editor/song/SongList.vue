<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { t } from '@/i18n'
import { useNavigationStore } from '@/store/navigation'
import { nav, NavigationPath } from '@/navigationTree'
import { getSongs, addSong, uploadSongFile, deleteSong } from '@/apis/song'
import type { Song } from '@shared/song/types'
import { formatDuration } from '@/utils/format'
import { DeleteIcon, EditIcon, MusicIcon } from '@/icons/svg'


const songs = ref<Song[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const navStore = useNavigationStore()

const selectedTags = ref<string[]>([])
const selectedTriggers = ref<string[]>([])

const allTags = computed(() => {
  const tags = new Set<string>()
  for (const song of songs.value) {
    if (song.info.tags) song.info.tags.forEach(t => tags.add(t))
  }
  return Array.from(tags).sort()
})
const allTriggers = computed(() => {
  const triggers = new Set<string>()
  for (const song of songs.value) {
    if (song.info.triggers) song.info.triggers.forEach(t => triggers.add(t))
  }
  return Array.from(triggers).sort()
})

const filteredSongs = computed(() => {
  return songs.value.filter(song => {
    // Filtre tags
    if (selectedTags.value.length > 0) {
      if (!song.info.tags || !selectedTags.value.every(tag => song.info.tags!.includes(tag))) {
        return false
      }
    }
    // Filtre triggers
    if (selectedTriggers.value.length > 0) {
      if (!song.info.triggers || !selectedTriggers.value.every(trig => song.info.triggers!.includes(trig))) {
        return false
      }
    }
    return true
  })
})

async function loadSongs() {
  loading.value = true
  error.value = null
  try {
    const result = await getSongs()
    if (result?.success) {
      songs.value = result.data?.songs || []
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
  navStore.navigateTo(nav.editor.songs.edit as NavigationPath, { uid })
}

async function addSongUI() {
  // Create a file input element
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'audio/mp3'
  
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    // First create the song entry
    const result = await addSong({
      info: {
        name: file.name.replace('.mp3', ''),
        duration: 0, // We'll update this later
        tags: [],
        triggers: []
      }
    })

    if (result?.success && result.data?.song) {
      // Then upload the file
      const uploadResult = await uploadSongFile(result.data.song.uid, file)
      if (uploadResult?.success) {
        await loadSongs()
      }
    }
  }

  input.click()
}

async function deleteSongUI(uid: string) {
  if (!confirm(t('confirmDeleteSong'))) return
  
  try {
    const result = await deleteSong(uid)
    if (result?.success) {
      await loadSongs()
    } else {
      error.value = result?.error || t('unknownError')
    }
  } catch (e) {
    error.value = (e as Error).message
  }
}

onMounted(loadSongs)
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
            {{ t('songs') }}
          </h1>
          <p class="text-brand-400 text-base font-semibold">{{ songs.length }} {{ t('songs') }}</p>
        </div>
      </div>
      <button 
        @click="addSongUI" 
        class="bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 text-white rounded-2xl px-6 py-3 flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 text-base font-bold border-2 border-brand-200"
        :title="t('addSong')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M12 4v16m8-8H4"/>
        </svg>
        <span>{{ t('addSong') }}</span>
      </button>
    </div>

    <!-- Filtres tags/triggers -->
    <div class="mb-6">
      <div v-if="allTags.length" class="flex flex-wrap items-center gap-2 mb-2">
        <span class="font-bold text-brand-700">Tags:</span>
        <button v-for="tag in allTags" :key="tag"
          @click="selectedTags = selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag]"
          :class="[
            'px-3 py-1 rounded-full font-bold text-sm border-2 transition',
            selectedTags.includes(tag)
              ? 'bg-brand-500 text-white border-brand-500 shadow'
              : 'bg-brand-100 text-brand-700 border-brand-200 hover:bg-brand-200'
          ]"
        >{{ tag }}</button>
      </div>
      <div v-if="allTriggers.length" class="flex flex-wrap items-center gap-2">
        <span class="font-bold text-brand-700">Triggers:</span>
        <button v-for="trig in allTriggers" :key="trig"
          @click="selectedTriggers = selectedTriggers.includes(trig) ? selectedTriggers.filter(t => t !== trig) : [...selectedTriggers, trig]"
          :class="[
            'px-3 py-1 rounded-full font-bold text-sm border-2 transition',
            selectedTriggers.includes(trig)
              ? 'bg-brand-500 text-white border-brand-500 shadow'
              : 'bg-brand-100 text-brand-700 border-brand-200 hover:bg-brand-200'
          ]"
        >{{ trig }}</button>
      </div>
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
            @click="loadSongs" 
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
          <!-- État vide -->
          <div v-if="songs.length === 0" class="text-center py-10">
            <div class="w-20 h-20 bg-gradient-to-br from-brand-100 to-brand-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span v-html="MusicIcon" class="text-pink-500 w-16 h-16 mx-auto block"></span>
            </div>
            <h3 class="text-xl font-bold text-brand-700 mb-2">{{ t('noSongs') }}</h3>
            <p class="text-brand-400 mb-6">{{ t('noSongsDesc') }}</p>
          </div>
          <!-- Grille des playlists -->
          <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div 
              v-for="song in filteredSongs" 
              :key="song.uid" 
              class="bg-brand-50 rounded-2xl shadow-lg px-6 py-5 mb-4 flex items-center justify-between border-2 border-brand-200"
            >
              <div class="flex flex-col flex-1 min-w-0">
                <span class="block font-extrabold text-lg text-brand-700 whitespace-normal break-words min-w-[120px]">{{ song.info.name }}</span>
                <span class="block text-xs text-brand-400 mt-1">{{ formatDuration(song.info.duration) }}</span>
              </div>
              <div class="flex gap-2">
                <button
                  @click="openEditor(song.uid)"
                  class="bg-brand-200 hover:bg-brand-300 text-brand-700 rounded-full p-2 transition shadow"
                  :title="t('edit')"
                >
                  <span v-html="EditIcon" class="w-10 h-10 inline-flex items-center justify-center"></span>
                </button>
                <button
                  @click="deleteSongUI(song.uid)"
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
  </div>
</template>