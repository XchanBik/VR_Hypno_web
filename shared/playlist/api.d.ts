import type { Playlist } from './types';
import type { ApiResponse } from '../api';
export type GetPlaylistsResponse = ApiResponse<{
    playlists: Playlist[];
}>;
export type GetPlaylistResponse = ApiResponse<{
    playlist: Playlist;
}>;
export type CreatePlaylistRequest = {
    name: string;
    repeat: boolean;
    sessions: string[];
};
export type CreatePlaylistResponse = ApiResponse<{
    playlist: Playlist;
}>;
export type UpdatePlaylistRequest = {
    uid: string;
    info: Playlist['info'];
};
export type UpdatePlaylistResponse = ApiResponse<null>;
