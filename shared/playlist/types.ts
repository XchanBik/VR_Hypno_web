export interface PlaylistInfo {
    name: string;
    repeat: boolean;
    sessions: string[];
    duration?: number;
  }
  
  // Pour l'usage UI/backend :
  export interface Playlist {
    uid: string;
    info: PlaylistInfo;
  } 