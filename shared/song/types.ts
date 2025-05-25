export interface SongInfo {
    name: string;
    duration: number;
    tags?: string[];
    triggers?: string[];
}
  
// Pour l'usage UI/backend :
export interface Song {
  uid: string;
  info: SongInfo;
} 