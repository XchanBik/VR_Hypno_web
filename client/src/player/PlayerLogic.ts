import ThreeJSManager from './three/ThreeJSManager'
import type { PlaylistInfo } from '@shared/playlist/types'
import type { SessionInfo } from '@shared/session/types'
import type { SongInfo } from '@shared/song/types'

export type PlayerMode = 'playlist' | 'editor'

export default class PlayerLogic {
  private three: ThreeJSManager
  private audio: HTMLAudioElement
  private playlist: PlaylistInfo | null = null
  private sessions: SessionInfo[] = []
  private songs: SongInfo[] = []
  private mode: PlayerMode = 'playlist'
  private isPlaying = false
  private currentTime = 0
  private currentSessionIndex = 0

  constructor(three: ThreeJSManager, audio: HTMLAudioElement) {
    this.three = three
    this.audio = audio
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime
    })
  }

  /** Set the player mode: 'playlist' (auto play) or 'editor' (jump mode) */
  setMode(mode: PlayerMode) {
    this.mode = mode
  }

  /** Load playlist and sessions, but do not start playback */
  async loadPlaylist(playlist: PlaylistInfo, sessions: SessionInfo[], songs: SongInfo[]) {
    this.playlist = playlist
    this.sessions = sessions
    this.songs = songs
    // Tell ThreeJSManager to load the waiting scene
    await this.three.showWaitingScene()
    // Optionally preload 3D assets here
  }

  /** Start playback (from UI or VR trigger) */
  async play() {
    if (!this.playlist || !this.sessions.length) return
    // Ensure 3D objects are loaded
    await this.three.startSession(this.sessions[this.currentSessionIndex])
    this.audio.play()
    this.isPlaying = true
  }

  /** Pause playback */
  pause() {
    this.audio.pause()
    this.isPlaying = false
  }

  /** Jump to a specific time (editor mode) */
  async jumpToTime(time: number) {
    this.audio.currentTime = time
    await this.three.jumpToTime(time)
    this.currentTime = time
  }

  /** Go to next session (playlist mode) */
  async nextSession() {
    if (this.currentSessionIndex < this.sessions.length - 1) {
      this.currentSessionIndex++
      await this.three.startSession(this.sessions[this.currentSessionIndex])
      this.audio.currentTime = 0
      if (this.isPlaying) this.audio.play()
    }
  }

  /** Go to previous session (playlist mode) */
  async previousSession() {
    if (this.currentSessionIndex > 0) {
      this.currentSessionIndex--
      await this.three.startSession(this.sessions[this.currentSessionIndex])
      this.audio.currentTime = 0
      if (this.isPlaying) this.audio.play()
    }
  }

  /** Stop playback and reset */
  stop() {
    this.pause()
    this.audio.currentTime = 0
    this.currentSessionIndex = 0
    this.currentTime = 0
    this.three.showWaitingScene()
  }
} 