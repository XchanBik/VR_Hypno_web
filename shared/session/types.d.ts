export interface SessionInfo {
    name: string;
    song_uid: string;
    description?: string;
}
export interface Session {
    uid: string;
    info: SessionInfo;
}
