/*
import type { PlaylistInfo } from '@shared/playlist/types'
import type { SessionInfo } from '@shared/session/types'
import type { SongInfo } from '@shared/song/types'

export interface PlaylistPlayerEvents {
  onSessionStart: (session: SessionInfo) => void
  onSessionEnd: (session: SessionInfo) => void
  onSongStart: (song: SongInfo) => void
  onSongEnd: (song: SongInfo) => void
  onPlaylistEnd: () => void
  onError: (error: Error) => void
}

export class PlaylistPlayer {
  private playlist: PlaylistInfo | null = null
  private sessions: SessionInfo[] = []
  private songs: SongInfo[] = []
  private currentSessionIndex = 0
  private currentSongIndex = 0
  private isPlaying = false
  private events: Partial<PlaylistPlayerEvents> = {}

  constructor(playlistUid: string) {
    this.loadPlaylist(playlistUid)
  }

  private async loadPlaylist(uid: string) {
    try {
      const response = await fetch(`/api/playlists/${uid}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error('Failed to load playlist')
      }

      this.playlist = data.data.playlist.info
      await this.loadSessions()
      await this.loadSongs()
    } catch (error) {
      this.events.onError?.(error as Error)
    }
  }

  private async loadSessions() {
    if (!this.playlist) return

    try {
      const sessionPromises = this.playlist.sessions.map(async (uid) => {
        const response = await fetch(`/api/sessions/${uid}`)
        const data = await response.json()
        if (!data.success) throw new Error(`Failed to load session ${uid}`)
        return data.data.session.info
      })

      this.sessions = await Promise.all(sessionPromises)
    } catch (error) {
      this.events.onError?.(error as Error)
    }
  }

  private async loadSongs() {
    if (!this.playlist) return

    try {
      const songPromises = this.sessions.flatMap(session => 
        session.songs.map(async (uid) => {
          const response = await fetch(`/api/songs/${uid}`)
          const data = await response.json()
          if (!data.success) throw new Error(`Failed to load song ${uid}`)
          return data.data.song.info
        })
      )

      this.songs = await Promise.all(songPromises)
    } catch (error) {
      this.events.onError?.(error as Error)
    }
  }

  public on<T extends keyof PlaylistPlayerEvents>(event: T, callback: PlaylistPlayerEvents[T]) {
    this.events[event] = callback
  }

  public start() {
    if (!this.playlist || this.sessions.length === 0) {
      this.events.onError?.(new Error('No playlist or sessions loaded'))
      return
    }

    this.isPlaying = true
    this.playCurrentSession()
  }

  public stop() {
    this.isPlaying = false
  }

  private async playCurrentSession() {
    if (!this.isPlaying || !this.sessions[this.currentSessionIndex]) return

    const session = this.sessions[this.currentSessionIndex]
    this.events.onSessionStart?.(session)

    for (const songUid of session.songs) {
      if (!this.isPlaying) break

      const song = this.songs.find(s => s.uid === songUid)
      if (!song) continue

      this.events.onSongStart?.(song)
      // Here you would integrate with your audio system
      await new Promise(resolve => setTimeout(resolve, song.duration * 1000))
      this.events.onSongEnd?.(song)
    }

    this.events.onSessionEnd?.(session)
    this.currentSessionIndex++

    if (this.currentSessionIndex < this.sessions.length) {
      this.playCurrentSession()
    } else if (this.playlist.repeat) {
      this.currentSessionIndex = 0
      this.playCurrentSession()
    } else {
      this.events.onPlaylistEnd?.()
    }
  }

  public getCurrentSession(): SessionInfo | null {
    return this.sessions[this.currentSessionIndex] || null
  }

  public getCurrentSong(): SongInfo | null {
    const session = this.getCurrentSession()
    if (!session) return null
    return this.songs.find(s => s.uid === session.songs[this.currentSongIndex]) || null
  }

  public getPlaylistInfo(): PlaylistInfo | null {
    return this.playlist
  }
} 
*/