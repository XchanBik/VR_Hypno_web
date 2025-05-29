import './player_style.css'
import PlayerManager from '@/player/ui/PlayerManager';

const root = document.getElementById('vr-player-root')
const pathParts = window.location.pathname.split('/')
const vrplayerIndex = pathParts.indexOf('vrplayer')
const playlistUid = vrplayerIndex !== -1 && pathParts[vrplayerIndex + 1] ? pathParts[vrplayerIndex + 1] : null

if (root && playlistUid) {
    const playerManager = new PlayerManager();
    playerManager.init();
    await playerManager.readPlaylist(playlistUid);
}

/*

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
        // Only set up audio, do not play yet!
        setupAudioElement()
        const songUid = getCurrentSongUid()
        if (audio && songUid) {
            audio.src = getSongStreamUrl(songUid)
            audio.currentTime = 0
        }
    } catch (err: any) {
        const statusDiv = document.getElementById('vr-status')
        if (statusDiv) statusDiv.textContent = 'Failed to load playlist: ' + err.message
    }
}
    
*/