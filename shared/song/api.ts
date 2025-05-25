import type { Song } from './types'
import type { ApiResponse } from '../api'

export type GetSongsResponse = ApiResponse<{ songs: Song[] }>
export type GetSongResponse = ApiResponse<{ song: Song }>
export type AddSongRequest = { /* tes champs */ }
export type AddSongResponse = ApiResponse<{ song: Song }>
export type UpdateSongRequest = { uid: string; info: any }
export type UpdateSongResponse = ApiResponse<null> 