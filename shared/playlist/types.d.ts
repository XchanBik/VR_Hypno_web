export interface PlaylistInfo {
    name: string;
    repeat: boolean;
    sessions: string[];
    duration?: number;
}
export interface Playlist {
    uid: string;
    info: PlaylistInfo;
}
