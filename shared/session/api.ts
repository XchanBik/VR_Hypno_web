import type { Session } from './types'
import type { ApiResponse } from '../api'

// SESSIONS
export type GetSessionsResponse = ApiResponse<{ sessions: Session[] }>
export type GetSessionResponse = ApiResponse<{ session: Session }>
export type CreateSessionRequest = { info: any }
export type CreateSessionResponse = ApiResponse<{ session: Session }>
export type UpdateSessionRequest = { uid: string; info: any }
export type UpdateSessionResponse = ApiResponse<null>