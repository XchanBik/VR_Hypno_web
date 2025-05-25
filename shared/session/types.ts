export interface SessionInfo {
    name: string;
    song_uid: string;
    description?: string;
}
  
// Pour l'usage UI/backend :
export interface Session {
  uid: string;
  info: SessionInfo;
} 