import type {
  GetSongsResponse,
  GetSongResponse,
  AddSongRequest,
  AddSongResponse,
  UpdateSongRequest,
  UpdateSongResponse,
  DeleteSongResponse
} from '@shared/song/api'

export async function getSongs(): Promise<GetSongsResponse> {
  const res = await fetch('/api/songs')
  return res.json()
}

export async function getSong(uid: string): Promise<GetSongResponse> {
  const res = await fetch(`/api/songs/${uid}`)
  return res.json()
}

export async function addSong(data: AddSongRequest): Promise<AddSongResponse> {
  const res = await fetch('/api/songs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function uploadSongFile(uid: string, file: File): Promise<{ success: boolean; error?: string }> {
  const formData = new FormData()
  formData.append('audio', file)
  
  const res = await fetch(`/api/songs/${uid}/upload`, {
    method: 'POST',
    body: formData
  })
  return res.json()
}

export async function updateSong(data: UpdateSongRequest): Promise<UpdateSongResponse> {
  const res = await fetch('/api/songs', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function deleteSong(uid: string): Promise<DeleteSongResponse> {
  const res = await fetch(`/api/songs/${uid}`, {
    method: 'DELETE'
  })
  return res.json()
} 