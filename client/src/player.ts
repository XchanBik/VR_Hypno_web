import { initVRPlayer } from '@/player/VRPlayer'
import './style.css'

// Get playlist UID from URL path
const pathParts = window.location.pathname.split('/')
const vrplayerIndex = pathParts.indexOf('vrplayer')
const playlistUid = vrplayerIndex !== -1 && pathParts[vrplayerIndex + 1] ? pathParts[vrplayerIndex + 1] : null

if (!playlistUid) {
  document.getElementById('vr-player')!.innerHTML = 'No playlist UID provided'
} else {
  initVRPlayer(playlistUid)
} 