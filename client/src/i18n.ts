import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from './store/app'

const messages = {
  en: {
    appTitle: 'VR Hypno',
    player: 'Player',
    editor: 'Editor',
    playlists: 'Playlists',
    addPlaylist: 'Add Playlist',
    createPlaylist: 'Create Playlist',
    loadingPlaylist: 'Loading playlists...',
    playlistName: 'Playlist name',
    repeat: 'Repeat',
    noPlaylists: 'No playlists yet. Click + to create one!',
    loading: 'Loading ...',
    unknownError: 'Unknown error',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    save: 'Save',
    sessions: 'Sessions',
    songs: 'Songs',
    addSong: 'Add Song',
    songName: 'Song name',
    noSongs: 'No songs',
    noSongsDesc: 'Add your first song to get started',
    duration: 'Duration',
    tags: 'Tags',
    back: 'Back',
    edit: 'Edit',
    delete: 'Delete',
    confirmDeleteSong: 'Are you sure you want to delete this song?',
    confirmDeleteSession: 'Are you sure you want to delete this session?',
    retry: 'Retry',
    confirmDeletePlaylist: 'Are you sure you want to delete this playlist?'
  },
  fr: {
    appTitle: 'VR Hypno',
    player: 'Lecteur',
    editor: 'Éditeur',
    playlists: 'Playlists',
    addPlaylist: 'Ajouter une playlist',
    createPlaylist: 'Créer une playlist',
    loadingPlaylist:  'Chargement des playlists...',
    playlistName: 'Nom de la playlist',
    repeat: 'Répéter',
    noPlaylists: 'Aucune playlist pour l\'instant. Cliquez sur + pour en créer une !',
    loading: 'Chargement ...',
    unknownError: 'Erreur inconnue',
    cancel: 'Annuler',
    yes: 'Oui',
    no: 'Non',
    save: 'Enregistrer',
    sessions: 'Sessions',
    songs: 'Chansons',
    addSong: 'Ajouter une chanson',
    songName: 'Nom de la chanson',
    noSongs: 'Aucune chanson',
    noSongsDesc: 'Ajoutez votre première chanson pour commencer',
    duration: 'Durée',
    tags: 'Tags',
    back: 'Retour',
    edit: 'Éditer',
    delete: 'Supprimer',
    confirmDeleteSong: 'Êtes-vous sûr de vouloir supprimer cette chanson ?',
    confirmDeleteSession: 'Êtes-vous sûr de vouloir supprimer cette session ?',
    retry: 'Réessayer',
    confirmDeletePlaylist: 'Êtes-vous sûr de vouloir supprimer cette playlist ?'
  }
}

export function t(key: keyof typeof messages['en']) {
  const appStore = useAppStore()
  const { locale } = storeToRefs(appStore)
  return computed(() => messages[locale.value][key]).value
} 