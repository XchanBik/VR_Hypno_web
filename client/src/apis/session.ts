import type {
  GetSessionsResponse,
  GetSessionResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  UpdateSessionRequest,
  UpdateSessionResponse,
  DeleteSessionResponse
} from '@shared/session/api'

export async function getSessions(): Promise<GetSessionsResponse> {
  const res = await fetch('/api/sessions')
  return res.json()
}

export async function getSession(uid: string): Promise<GetSessionResponse> {
  const res = await fetch(`/api/sessions/${uid}`)
  return res.json()
}

export async function createSession(data: CreateSessionRequest): Promise<CreateSessionResponse> {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function updateSession(data: UpdateSessionRequest): Promise<UpdateSessionResponse> {
  const res = await fetch('/api/sessions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function deleteSession(uid: string): Promise<DeleteSessionResponse> {
  const res = await fetch(`/api/sessions/${uid}`, {
    method: 'DELETE'
  })
  return res.json()
} 