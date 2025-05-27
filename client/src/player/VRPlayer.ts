import { PlaylistPlayer, type PlaylistPlayerEvents } from './PlaylistPlayer'
import { ThreeScene, type ThreeSceneOptions } from './ThreeScene'
import type { SessionInfo } from '@shared/session/types'
import type { SongInfo } from '@shared/song/types'

export interface VRPlayerParams {
  debug?: boolean
  vr?: boolean
  quality?: 'low' | 'medium' | 'high'
  // Add any other parameters you need
}

export class VRPlayer extends ThreeScene {
  private player: PlaylistPlayer
  private params: VRPlayerParams

  constructor(playlistUid: string, options: ThreeSceneOptions, params: VRPlayerParams = {}) {
    super(options)
    this.params = params
    this.player = new PlaylistPlayer(playlistUid)
    this.setupEventListeners()
    
    if (this.params.debug) {
      console.log('VR Player initialized with params:', this.params)
    }
  }

  private setupEventListeners() {
    this.player.on('onSessionStart', this.onSessionStart.bind(this))
    this.player.on('onSessionEnd', this.onSessionEnd.bind(this))
    this.player.on('onSongStart', this.onSongStart.bind(this))
    this.player.on('onSongEnd', this.onSongEnd.bind(this))
    this.player.on('onPlaylistEnd', this.onPlaylistEnd.bind(this))
    this.player.on('onError', this.onError.bind(this))
  }

  private onSessionStart(session: SessionInfo) {
    if (this.params.debug) {
      console.log('Session started:', session)
    }
    // Update Three.js scene for new session
  }

  private onSessionEnd(session: SessionInfo) {
    if (this.params.debug) {
      console.log('Session ended:', session)
    }
    // Clean up session-specific Three.js objects
  }

  private onSongStart(song: SongInfo) {
    if (this.params.debug) {
      console.log('Song started:', song)
    }
    // Update Three.js scene for new song
  }

  private onSongEnd(song: SongInfo) {
    if (this.params.debug) {
      console.log('Song ended:', song)
    }
    // Clean up song-specific Three.js objects
  }

  private onPlaylistEnd() {
    if (this.params.debug) {
      console.log('Playlist ended')
    }
    // Handle playlist end in Three.js scene
  }

  private onError(error: Error) {
    console.error('Player error:', error)
    // Handle error in Three.js scene
  }

  public start() {
    super.start()
    this.player.start()
  }

  public stop() {
    super.stop()
    this.player.stop()
  }

  public dispose() {
    this.player.stop()
    super.dispose()
  }
}

export function initVRPlayer(playlistUid: string, params: VRPlayerParams = {}) {
  const container = document.getElementById('vr-player')
  if (!container) {
    console.error('VR player container not found')
    return
  }
  
  return new VRPlayer(playlistUid, {
    container,
    background: 0x111111,
    antialias: params.quality !== 'low'
  }, params)
} 