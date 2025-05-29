import './player_style.css'
import { getPlaylist } from '@/apis/playlist'
import { getSession } from '@/apis/session'
import { Session } from '@shared/session/types'
import { MusicIcon, NextIcon, PauseIcon, PlayIcon, PreviousIcon, SettingsIcon, SpeakerIcon, VRIcon } from './icons/svg'

const root = document.getElementById('vr-player-root')
const pathParts = window.location.pathname.split('/')
const vrplayerIndex = pathParts.indexOf('vrplayer')
const playlistUid = vrplayerIndex !== -1 && pathParts[vrplayerIndex + 1] ? pathParts[vrplayerIndex + 1] : null

let currentSessionIndex = 0
let sessions: Session[] = []
let isPlaying = false
let audio: HTMLAudioElement | null = null
let progressBar: HTMLInputElement | null = null
let progressTime: HTMLElement | null = null
let progressDuration: HTMLElement | null = null

function getCurrentSession(): Session | null {
    return sessions[currentSessionIndex] || null
}

function getCurrentSongUid(): string | null {
    const session = getCurrentSession()
    return session?.info.song_uid || null
}

function getSongStreamUrl(songUid: string): string {
    return `/api/songs/${songUid}/stream`
}

function setupAudioElement() {
    if (!audio) {
        audio = document.createElement('audio')
        audio.id = 'audio-player'
        audio.preload = 'auto'
        audio.style.display = 'none'
        document.body.appendChild(audio)
    }
    if (!progressBar) {
        progressBar = document.getElementById('audio-progress') as HTMLInputElement
    }
    if (!progressTime) {
        progressTime = document.getElementById('audio-current')
    }
    if (!progressDuration) {
        progressDuration = document.getElementById('audio-duration')
    }
    if (audio) {
        audio.ontimeupdate = updateProgressBar
        audio.onloadedmetadata = updateProgressBar
        audio.onended = () => {
            isPlaying = false
            updatePlayPauseButton()
        }
    }
    if (progressBar) {
        progressBar.addEventListener('input', onSeek)
    }
}

function playAudio() {
    if (!audio) return
    audio.play()
    isPlaying = true
    updatePlayPauseButton()
}

function pauseAudio() {
    if (!audio) return
    audio.pause()
    isPlaying = false
    updatePlayPauseButton()
}

function loadAndPlayCurrentSong() {
    setupAudioElement()
    const songUid = getCurrentSongUid()
    if (!audio || !songUid) return
    audio.src = getSongStreamUrl(songUid)
    audio.currentTime = 0
    playAudio()
}

function updateProgressBar() {
    if (!audio || !progressBar) return
    progressBar.max = audio.duration ? audio.duration.toString() : '1'
    progressBar.value = audio.currentTime ? audio.currentTime.toString() : '0'
    if (progressTime) progressTime.textContent = formatTime(audio.currentTime)
    if (progressDuration) progressDuration.textContent = formatTime(audio.duration)
}

function onSeek() {
    if (!audio || !progressBar) return
    audio.currentTime = parseFloat(progressBar.value)
}

function formatTime(sec: number): string {
    if (!isFinite(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}

function updatePlayPauseButton() {
    const playPauseIcon = document.getElementById('play-pause-icon')
    if (!playPauseIcon) return
    playPauseIcon.innerHTML = isPlaying ? PauseIcon : PlayIcon
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
    sessionsList.querySelectorAll('button[data-index]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSessionIndex = parseInt((btn as HTMLButtonElement).dataset.index!)
            updateCurrentSession()
            renderSessionsList()
            loadAndPlayCurrentSong()
        })
    })
}

function updateCurrentSession() {
    const currentSession = getCurrentSession()
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
        const titleEl = document.getElementById('playlist-title')
        const countEl = document.getElementById('playlist-count')
        if (titleEl) titleEl.textContent = playlist.info.name || 'Playlist'
        if (countEl) countEl.textContent = `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`
        renderSessionsList()
        updateCurrentSession()
        loadAndPlayCurrentSong()
    } catch (err: any) {
        const statusDiv = document.getElementById('vr-status')
        if (statusDiv) statusDiv.textContent = 'Failed to load playlist: ' + err.message
    }
}

document.getElementById('play-pause')?.addEventListener('click', () => {
    if (!audio) return
    if (isPlaying) {
        pauseAudio()
    } else {
        playAudio()
    }
})

document.getElementById('previous-btn')?.addEventListener('click', () => {
    if (currentSessionIndex > 0) {
        currentSessionIndex--
        updateCurrentSession()
        renderSessionsList()
        loadAndPlayCurrentSong()
    }
})

document.getElementById('next-btn')?.addEventListener('click', () => {
    if (currentSessionIndex < sessions.length - 1) {
        currentSessionIndex++
        updateCurrentSession()
        renderSessionsList()
        loadAndPlayCurrentSong()
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

    // Volume icon (simple speaker SVG)
    const volumeIcon = document.getElementById('volume-icon')
    if (volumeIcon) {
        volumeIcon.innerHTML = SpeakerIcon
    }
}

function setupVolumeControl() {
    const volumeSlider = document.getElementById('audio-volume') as HTMLInputElement | null
    setupAudioElement()
    if (volumeSlider && audio) {
        // Set initial value
        volumeSlider.value = audio.volume.toString()
        // Update audio volume on slider change
        volumeSlider.addEventListener('input', () => {
            if (audio) {
                audio.volume = parseFloat(volumeSlider.value)
            }
        })
    }
}

function renderAudioProgressBar() {
    // Add a progress bar below the controls if not present
    let bar = document.getElementById('audio-progress') as HTMLInputElement | null
    if (!bar) {
        const controls = document.querySelector('.col-span-2.bg-gray-800.border-t')
        if (controls) {
            const wrapper = document.createElement('div')
            wrapper.className = 'col-span-2 flex items-center space-x-2 px-6 pb-2'
            wrapper.innerHTML = `
                <span id="audio-current" class="text-xs text-gray-400">0:00</span>
                <input id="audio-progress" type="range" min="0" max="1" value="0" step="0.01" class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
                <span id="audio-duration" class="text-xs text-gray-400">0:00</span>
            `
            controls.parentNode?.insertBefore(wrapper, controls)
        }
    }
}

if (root) {
    setIcons()
    setupVolumeControl()
    renderAudioProgressBar()
    runVRPlayer(root, playlistUid)
}
