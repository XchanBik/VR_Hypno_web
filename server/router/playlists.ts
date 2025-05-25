import { Router } from 'express';
import { join } from 'path';
import { readdir, readFile, mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { ApiResponse } from '@shared/types';

// Types
interface PlaylistInfo {
  name: string;
  repeat: boolean;
  sessions: string[];
}

interface Playlist {
  uid: string;
  info: PlaylistInfo;
}

// Constants
const DATA_PATH = join(process.cwd(), 'data');
const PLAYLISTS_PATH = join(DATA_PATH, 'playlists');

// Utility functions
async function ensurePlaylistsDirectory() {
  if (!existsSync(DATA_PATH)) {
    await mkdir(DATA_PATH, { recursive: true });
  }
  if (!existsSync(PLAYLISTS_PATH)) {
    await mkdir(PLAYLISTS_PATH, { recursive: true });
  }
}

async function readPlaylistInfo(playlistFile: string) {
  try {
    const infoPath = join(PLAYLISTS_PATH, playlistFile);
    const content = await readFile(infoPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

// Route handlers
async function getAllPlaylists(req: any, res: any) {
  console.log('[playlist] GET /playlists called');
  try {
    await ensurePlaylistsDirectory();
    const entries = await readdir(PLAYLISTS_PATH, { withFileTypes: true });
    const folders = entries.filter(e => e.isDirectory());
    const playlists = await Promise.all(
      folders.map(async (folder) => {
        const uid = folder.name;
        const infoPath = join(PLAYLISTS_PATH, uid, 'info.json');
        try {
          const content = await readFile(infoPath, 'utf-8');
          const info = JSON.parse(content);
          return { uid, info };
        } catch (e) {
          console.warn(`[playlist] Could not read info.json for ${uid}:`, e);
          return null;
        }
      })
    );
    const filtered = playlists.filter((playlist) => playlist !== null);
    console.log(`[playlist] Returning ${filtered.length} playlists`);
    res.json({
      success: true,
      playlists: filtered,
    });
  } catch (error) {
    console.error('get-playlists error:', error);
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
}

async function getPlaylist(req: any, res: any) {
  const { uid } = req.params;
  console.log(`[playlist] GET /playlists/${uid} called`);
  try {
    await ensurePlaylistsDirectory();
    const infoPath = join(PLAYLISTS_PATH, uid, 'info.json');
    const content = await readFile(infoPath, 'utf-8');
    const info = JSON.parse(content);
    res.json({ success: true, playlist: info });
  } catch (error) {
    res.status(404).json({ 
      success: false, 
      error: 'Playlist not found' 
    });
  }
}

async function createPlaylist(req: any, res: any) {
  try {
    const { name, repeat, sessions } = req.body;
    console.log('[playlist] POST /playlists called with:', { name, repeat, sessions });
    
    await ensurePlaylistsDirectory();
    const uid = Math.random().toString(36).slice(2, 10);
    const playlistDir = join(PLAYLISTS_PATH, uid);
    
    console.log('[playlist] Creating playlist dir:', playlistDir);
    if (!existsSync(playlistDir)) {
      await mkdir(playlistDir, { recursive: true });
      console.log('[playlist] Directory created');
    } else {
      console.log('[playlist] Directory already exists');
    }

    const info = {
      name,
      repeat,
      sessions: sessions || [],
    };

    const infoPath = join(playlistDir, 'info.json');
    console.log('[playlist] Writing info.json at:', infoPath, 'with:', info);
    await writeFile(infoPath, JSON.stringify(info, null, 2), 'utf-8');
    
    console.log('[playlist] Playlist created successfully:', { uid, info });
    res.json({ 
      success: true, 
      playlist: { uid, info } 
    });
  } catch (error) {
    console.error('[playlist] create-playlist error:', error);
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
}

async function updatePlaylist(req: any, res: any) {
  try {
    const { uid } = req.params;
    const { info } = req.body;
    
    await ensurePlaylistsDirectory();
    const infoPath = join(PLAYLISTS_PATH, uid, 'info.json');
    await writeFile(infoPath, JSON.stringify(info, null, 2), 'utf-8');
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
}

// Router creation
export function createPlaylistsRouter() {
  const router = Router();

  router.get('/', getAllPlaylists);
  router.get('/:uid', getPlaylist);
  router.post('/', createPlaylist);
  router.put('/:uid', updatePlaylist);

  return router;
} 