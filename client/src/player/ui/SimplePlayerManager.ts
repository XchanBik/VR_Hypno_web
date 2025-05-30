import SessionPlayer from "@/player/three/SessionPlayer";
import { MusicIcon, NextIcon, PauseIcon, PlayIcon, PreviousIcon, SettingsIcon, SpeakerIcon, VRIcon } from "@/icons/svg";
import AudioManager from "./AudioManager";
import { Session } from "@shared/session/types";
import { XRStateListener } from "@/player/three/XRManager";
import { getPlaylist } from '@/apis/playlist'
import { getSession } from '@/apis/session'

export default class SimplePlayerManager implements XRStateListener {

    //Player
    private container: HTMLElement | null = null;
    private sessionPlayer: SessionPlayer | null = null;
    private audioManager: AudioManager | null = null;

    // UI
    private playPauseIcon: HTMLElement | null = null;
    private previousIcon: HTMLElement | null = null;
    private nextIcon: HTMLElement | null = null;
    private vrButton: HTMLButtonElement | null = null;
    private sessionsList: HTMLElement | null = null;
    private sessionName: HTMLElement | null = null;
    private sessionDescription: HTMLElement | null = null;
    private vrStatus: HTMLElement | null = null;

    // Playlist
    private sessions: Session[] = []
    private currentIndex: number = 0

    private initEnded: boolean = false;
    async init() {
        this.container = document.getElementById('canvas-container') as HTMLElement
        if (!this.container) {
            throw new Error('Container not found')
        }

        //Init SomeHTML
        this.setIcons();
        this.setAudio();
        this.setButtonEvents();

        //Session Player
        this.sessionPlayer = new SessionPlayer(this.container)
        this.sessionPlayer.addXRStateListener(this)

        //Finish init
        this.initEnded = true;
    }

    // XRStateListener
    onXRStart() {
        if (!this.vrButton) {
            throw new Error('VR button not found')
        }
        this.vrButton.textContent = 'VR Active'
        this.vrButton.disabled = true
        this.vrButton.className = 'w-full px-4 py-3 rounded-lg text-white font-semibold bg-gray-500 cursor-not-allowed transition-all duration-300 shadow-lg'
    }
    onXRStop() {
        if (!this.vrButton) {
            throw new Error('VR button not found')
        }
        this.vrButton.textContent = 'Start VR'
        this.vrButton.disabled = false
        this.vrButton.className = 'w-full px-4 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl'
    }    
    onXRPending() {
        if (!this.vrButton) {
            throw new Error('VR button not found')
        }
        this.vrButton.textContent = 'Put HeadSet On ...'
        this.vrButton.disabled = true
        this.vrButton.className = 'w-full px-4 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl'
    }

    // Audio
    private setAudio() {        
        const audio = document.getElementById('audio-player') as HTMLAudioElement | null
        const progressBar = document.getElementById('audio-progress') as HTMLInputElement | null
        const volumeSlider = document.getElementById('audio-volume') as HTMLInputElement | null
        if (!audio || !progressBar || !volumeSlider) {
            throw new Error('(setAudio) Audio or progress bar not found')
        }
        this.audioManager = new AudioManager(audio, progressBar, volumeSlider)

        const progressTime = document.getElementById('audio-current')
        const progressDuration = document.getElementById('audio-duration')
        if (!progressTime || !progressDuration) {
            throw new Error('Progress time or duration not found')
        }
        this.audioManager.setProgressTime(progressTime)
        this.audioManager.setProgressDuration(progressDuration)
        this.audioManager.onStateChange = (isPlaying: boolean) => this.handleAudioStateChange(isPlaying)
        this.audioManager.onAudioEnded = () => this.handleAudioEnded()
    }

    //Events Handlers
    private handleAudioStateChange(isPlaying: boolean) {
        if (!this.playPauseIcon) {
            throw new Error('Play pause icon not found')
        }
        this.playPauseIcon.innerHTML = isPlaying ? PauseIcon : PlayIcon
    }

    private handleAudioEnded() {
        this.handleNextIconClick()
    }
        
    private setIcons() {
        this.playPauseIcon = document.getElementById('play-pause-icon')
        this.previousIcon = document.getElementById('previous-icon')
        this.nextIcon = document.getElementById('next-icon')
        this.vrButton = document.getElementById('vr-btn') as HTMLButtonElement
        this.sessionsList = document.getElementById('sessions-list')
        this.sessionName = document.getElementById('current-session-name')
        this.sessionDescription = document.getElementById('current-session-description')
        this.vrStatus = document.getElementById('vr-status')


        if (!this.playPauseIcon || !this.previousIcon || !this.nextIcon || !this.vrButton 
            || !this.sessionsList || !this.sessionName || !this.sessionDescription || !this.vrStatus) {
            throw new Error('Play pause icon not found')
        }
        this.playPauseIcon.innerHTML = PlayIcon
        this.previousIcon.innerHTML = PreviousIcon
        this.nextIcon.innerHTML = NextIcon
        this.sessionsList.innerHTML = renderSessionsList(this.sessions)

        const permissionIcon = document.getElementById('vr-permission-icon')
        if (permissionIcon) {
            permissionIcon.innerHTML = VRIcon
        }
        const settingsIcon = document.getElementById('settings-icon')
        if (settingsIcon) {
            settingsIcon.innerHTML = SettingsIcon
        }
        const sessionIcon = document.getElementById('current-session-icon')
        if (sessionIcon) {
            sessionIcon.innerHTML = MusicIcon
        }
        const volumeIcon = document.getElementById('volume-icon')
        if (volumeIcon) {
            volumeIcon.innerHTML = SpeakerIcon
        }   
    }

    //Session
    private refreshCurrentSession() {
        if (!this.sessionPlayer || !this.sessionsList || !this.audioManager ||
            !this.sessionName || !this.sessionDescription || !this.vrStatus
        ) {
            throw new Error('Session player not found')
        }
        updateSelectedSession(this.sessionsList, this.currentIndex);
        const currentSession = this.sessions[this.currentIndex]
        this.sessionName.textContent = currentSession.info.name || 'Untitled Session'
        this.sessionDescription.textContent = currentSession.info.description || 'VR Experience'
        this.vrStatus.textContent = `Session: ${currentSession.info.name || 'Untitled'}`        

        this.sessionPlayer.loadSession(currentSession, this.audioManager)
    }

    //Events Handlers
    private handlePlayPauseClick() {
        if (!this.audioManager) {
            throw new Error('Audio manager not found')
        }
        if (this.audioManager.isPlaying) {
            this.audioManager.pauseAudio()
        } else {
            this.audioManager.playAudio()
        }
    }
    private handleNextIconClick() {
        if (this.currentIndex < this.sessions.length - 1) {
            this.currentIndex++;
            this.refreshCurrentSession();
        } else {
            this.stopPlayback();
        }
    }
    private handlePreviousIconClick() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.refreshCurrentSession();
        }
    }
    private stopPlayback() {
        if (!this.audioManager) {
            throw new Error('Audio manager not found')
        }
        this.audioManager.stopAudio()
    }    

    private setButtonEvents() {
        if (!this.playPauseIcon || !this.previousIcon || !this.nextIcon || !this.vrButton || !this.sessionsList) {
            throw new Error('some buttons not found')
        }
        this.playPauseIcon.addEventListener('click', () => this.handlePlayPauseClick())
        this.nextIcon.addEventListener('click', () => this.handleNextIconClick())
        this.previousIcon.addEventListener('click', () => this.handlePreviousIconClick())
        this.vrButton.addEventListener('click', () => this.sessionPlayer!.startVR())
    }

    private setSessionsListEvents() {
        if (!this.sessionsList) {
            throw new Error('Sessions list not found')
        }
        this.sessionsList.querySelectorAll('button[data-index]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentIndex = parseInt((btn as HTMLButtonElement).dataset.index!)
                this.refreshCurrentSession()
            })
        })
    }

    async readPlaylist(playlistUid: string) {
        if (!this.sessionsList) {
            throw new Error('Sessions list not found')
        }
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
        this.sessions = sessionResults.filter(Boolean) as Session[]
        this.sessionsList.innerHTML = renderSessionsList(this.sessions)
        this.setSessionsListEvents();
        this.refreshCurrentSession();
        await this.sessionPlayer!.startThree();
    }
}

// 1. Base render function that creates the HTML structure
function renderSessionsList(sessions: Session[]): string {
    return sessions.map((session, index) => `
        <li class="playlist-item">
            <button class="w-full p-3 rounded-lg cursor-pointer transition-colors border-l-3 text-left bg-gray-700 hover:bg-gray-600 border-transparent hover:border-blue-400" 
                    data-index="${index}">
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
    `).join('');
}

// 2. Function to update the selected session's appearance
function updateSelectedSession(
    sessionsList: HTMLElement,
    selectedIndex: number
): void {
    // Reset all buttons to default state
    sessionsList.querySelectorAll('button[data-index]').forEach(btn => {
        btn.className = 'w-full p-3 rounded-lg cursor-pointer transition-colors border-l-3 text-left bg-gray-700 hover:bg-gray-600 border-transparent hover:border-blue-400';
    });

    // Set selected button state
    const selectedBtn = sessionsList.querySelector(`button[data-index="${selectedIndex}"]`);
    if (selectedBtn) {
        selectedBtn.className = 'w-full p-3 rounded-lg cursor-pointer transition-colors border-l-3 text-left bg-gray-600 border-blue-500';
    }
}