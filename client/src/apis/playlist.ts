import type {
    GetPlaylistsResponse,
    GetPlaylistResponse,
    CreatePlaylistRequest,
    CreatePlaylistResponse,
    UpdatePlaylistRequest,
    UpdatePlaylistResponse
  } from '@shared/playlist/api'
  
  export async function getPlaylists(): Promise<GetPlaylistsResponse> {
    const res = await fetch('/api/playlists')
    return res.json()
  }
  
  export async function getPlaylist(uid: string): Promise<GetPlaylistResponse> {
    const res = await fetch(`/api/playlists/${uid}`)
    return res.json()
  }
  
  export async function createPlaylist(data: CreatePlaylistRequest): Promise<CreatePlaylistResponse> {
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  }
  
  export async function updatePlaylist(data: UpdatePlaylistRequest): Promise<UpdatePlaylistResponse> {
    const res = await fetch(`/api/playlists/${data.uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ info: data.info })
    })
    return res.json()
  }