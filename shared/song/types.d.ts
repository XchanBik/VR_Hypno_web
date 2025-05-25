export interface SongInfo {
    name: string;
    duration: number;
    tags?: string[];
    triggers?: string[];
}
export interface Song {
    uid: string;
    info: SongInfo;
}
