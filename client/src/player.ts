import './player_style.css'
import { getPlaylist } from '@/apis/playlist'
import { getSession } from '@/apis/session'
import type { GetPlaylistResponse } from '@shared/playlist/api'
import { Session } from '@shared/session/types'

const root = document.getElementById('vr-player-root')
const pathParts = window.location.pathname.split('/')
const vrplayerIndex = pathParts.indexOf('vrplayer')
const playlistUid = vrplayerIndex !== -1 && pathParts[vrplayerIndex + 1] ? pathParts[vrplayerIndex + 1] : null

let currentSessionIndex = 0
let sessions: Session[] = []
let isPlaying = false

function updatePlayPauseButton() {
    const playPauseIcon = document.getElementById('play-pause-icon')
    if (!playPauseIcon) return

    playPauseIcon.innerHTML = isPlaying ? `
        <svg class="w-full h-full" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
    ` : `
        <svg class="w-full h-full" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
        </svg>
    `
}

function renderSessionsList() {
    const sessionsList = document.getElementById('sessions-list')
    if (!sessionsList) return

    sessionsList.innerHTML = sessions.map((session, index) => `
        <li class="playlist-item">
            <button class="w-full p-3 rounded-lg cursor-pointer transition-colors border-l-3 text-left ${
                index === currentSessionIndex 
                    ? 'bg-gray-600 border-blue-500' 
                    : 'bg-gray-700 hover:bg-gray-600 border-transparent hover:border-blue-400'
            }" data-index="${index}">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-8 bg-gray-600 rounded flex items-center justify-center">
                        <div class="w-4 h-4 text-gray-300">
                            <svg class="w-full h-full" viewBox="0 0 15 15" fill="currentColor">
                                <path d="M13.5,1c-0.0804,0.0008-0.1594,0.0214-0.23,0.06L4.5,3.5C4.2239,3.5,4,3.7239,4,4v6.28C3.6971,10.1002,3.3522,10.0037,3,10c-1.1046,0-2,0.8954-2,2s0.8954,2,2,2s2-0.8954,2-2V7.36l8-2.22v3.64c-0.3029-0.1798-0.6478-0.2763-1-0.28c-1.1046,0-2,0.8954-2,2s0.8954,2,2,2s2-0.8954,2-2v-9C14,1.2239,13.7761,1,13.5,1z M13,4.14L5,6.36v-2l8-2.22C13,2.14,13,4.14,13,4.14z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-sm font-medium text-white truncate">${session.info.name || 'Untitled Session'}</h3>
                        <p class="text-xs text-gray-400">${session.info.description || 'VR Session'}</p>
                    </div>
                </div>
            </button>
        </li>
    `).join('')

    // Add click listeners
    sessionsList.querySelectorAll('button[data-index]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSessionIndex = parseInt((btn as HTMLButtonElement).dataset.index!)
            updateCurrentSession()
            renderSessionsList()
        })
    })
}

function updateCurrentSession() {
    const currentSession = sessions[currentSessionIndex]
    if (!currentSession) return

    const nameEl = document.getElementById('current-session-name')
    const descEl = document.getElementById('current-session-description')
    const statusEl = document.getElementById('vr-status')

    if (nameEl) nameEl.textContent = currentSession.info.name || 'Untitled Session'
    if (descEl) descEl.textContent = currentSession.info.description || 'VR Experience'
    if (statusEl) statusEl.textContent = `Session: ${currentSession.info.name || 'Untitled'}`
}

async function fetchPlaylistAndSessions(playlistUid: string) {
    const result = await getPlaylist(playlistUid)
    if (!result.success || !result.data?.playlist) {
        throw new Error(result.error || 'Failed to load playlist')
    }

    const playlist = result.data.playlist

    const sessionResults = await Promise.all(
        playlist.info.sessions.map(uid =>
            getSession(uid)
                .then(res => res.success && res.data?.session ? res.data.session : null)
                .catch(err => {
                    console.error('Session fetch error:', err)
                    return null
                })
        )
    )

    sessions = sessionResults.filter(Boolean) as Session[]
    return playlist
}

async function runVRPlayer(root: HTMLElement, playlistUid: string | null) {
    const errorDiv = document.getElementById('vr-error')
    const uiDiv = document.getElementById('vr-ui')

    if (!playlistUid) {
        if (errorDiv) errorDiv.classList.remove('hidden')
        return
    }

    try {
        if (errorDiv) errorDiv.classList.add('hidden')

        const playlist = await fetchPlaylistAndSessions(playlistUid)

        // Update UI
        const titleEl = document.getElementById('playlist-title')
        const countEl = document.getElementById('playlist-count')

        if (titleEl) titleEl.textContent = playlist.info.name || 'Playlist'
        if (countEl) countEl.textContent = `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`

        renderSessionsList()
        updateCurrentSession()
    } catch (err: any) {
        const statusDiv = document.getElementById('vr-status')
        if (statusDiv) statusDiv.textContent = 'Failed to load playlist: ' + err.message
    }
}

// Player Controls
document.getElementById('play-pause')?.addEventListener('click', () => {
    isPlaying = !isPlaying
    updatePlayPauseButton()
})

document.getElementById('previous-btn')?.addEventListener('click', () => {
    if (currentSessionIndex > 0) {
        currentSessionIndex--
        updateCurrentSession()
        renderSessionsList()
    }
})

document.getElementById('next-btn')?.addEventListener('click', () => {
    if (currentSessionIndex < sessions.length - 1) {
        currentSessionIndex++
        updateCurrentSession()
        renderSessionsList()
    }
})

if (root) {
    runVRPlayer(root, playlistUid)
}
