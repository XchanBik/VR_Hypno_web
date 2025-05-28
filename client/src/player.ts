import './style.css'
import { getPlaylist } from '@/apis/playlist'
import type { GetPlaylistResponse } from '@shared/playlist/api'

const root = document.getElementById('vr-player-root')
const pathParts = window.location.pathname.split('/')
const vrplayerIndex = pathParts.indexOf('vrplayer')
const playlistUid = vrplayerIndex !== -1 && pathParts[vrplayerIndex + 1] ? pathParts[vrplayerIndex + 1] : null

function runVRPlayer(root: HTMLElement, playlistUid: string | null) {
  const errorDiv = document.getElementById('vr-error')
  const uiDiv = document.getElementById('vr-ui')
  if (!playlistUid) {
    if (errorDiv) errorDiv.classList.remove('hidden')
    if (uiDiv) uiDiv.classList.add('hidden')
    return
  }

  // Hide error, show UI
  if (errorDiv) errorDiv.classList.add('hidden')
  if (uiDiv) uiDiv.classList.remove('hidden')

  getPlaylist(playlistUid)
    .then((result: GetPlaylistResponse) => {
      if (!result.success) throw new Error(result.error || 'Unknown error')
      const playlist = result.data?.playlist
      if (!playlist) throw new Error('No playlist data')
      const sessions = playlist.info.sessions || []
      let currentSessionIndex = 0

      function render() {
        // Render current session player (center/left)
        const session = sessions[currentSessionIndex]
        const statusDiv = document.getElementById('vr-status')
        if (statusDiv) statusDiv.textContent = session ? `Session: ${session}` : 'No session'

        // Render session list (right)
        let sessionListHtml = '<div class="flex flex-col space-y-2">'
        sessions.forEach((s: any, i: number) => {
          sessionListHtml += `
            <button class="px-4 py-2 rounded ${i === currentSessionIndex ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}"
              data-index="${i}">
              ${s.name}
            </button>
          `
        })
        sessionListHtml += '</div>'
        let sessionListDiv = document.getElementById('session-list')
        if (!sessionListDiv) {
          sessionListDiv = document.createElement('div')
          sessionListDiv.id = 'session-list'
          sessionListDiv.className = 'absolute right-8 top-8 bg-gray-800 p-4 rounded shadow-lg'
          root.appendChild(sessionListDiv)
        }
        if (sessionListDiv) sessionListDiv.innerHTML = sessionListHtml

        // Add click listeners
        if (sessionListDiv) {
          sessionListDiv.querySelectorAll('button[data-index]').forEach(btn => {
            btn.addEventListener('click', () => {
              currentSessionIndex = parseInt((btn as HTMLButtonElement).dataset.index!)
              render()
            })
          })
        }
      }

      render()
    })
    .catch(err => {
      const statusDiv = document.getElementById('vr-status')
      if (statusDiv) statusDiv.textContent = 'Failed to load playlist: ' + err.message
    })
}

if (root) {
  runVRPlayer(root, playlistUid)
} 