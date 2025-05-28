import './player_style.css'
import { getPlaylist } from '@/apis/playlist'
import { getSession } from '@/apis/session'
import { Session } from '@shared/session/types'
import { MusicIcon, NextIcon, PauseIcon, PlayIcon, PreviousIcon, SettingsIcon, VRIcon } from './icons/svg'

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

    playPauseIcon.innerHTML = isPlaying ? PlayIcon : PauseIcon
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
                        <div class="w-4 h-4 text-gray-300" id="session-icon">
                            ${MusicIcon}
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

function setIcons() {
    const permissionIcon = document.getElementById('vr-permission-icon')
    if (permissionIcon) {
        permissionIcon.innerHTML = VRIcon
    }
    const playPauseIcon = document.getElementById('play-pause-icon')
    if (playPauseIcon) {
        playPauseIcon.innerHTML = PlayIcon
    }
    const previousIcon = document.getElementById('previous-icon')
    if (previousIcon) {
        previousIcon.innerHTML = PreviousIcon
    }
    const nextIcon = document.getElementById('next-icon')
    if (nextIcon) {
        nextIcon.innerHTML = NextIcon
    }
    const settingsIcon = document.getElementById('settings-icon')
    if (settingsIcon) {
        settingsIcon.innerHTML = SettingsIcon
    }
    const sessionIcon = document.getElementById('current-session-icon')
    if (sessionIcon) {
        sessionIcon.innerHTML = MusicIcon
    }
}

if (root) {
    setIcons()
    runVRPlayer(root, playlistUid)
}
