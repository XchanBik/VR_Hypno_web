import { Router, Request, Response } from 'express';
import { join } from 'path';
import { readdir, readFile, mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import type {
  GetSongsResponse,
  GetSongResponse,
  AddSongRequest,
  AddSongResponse,
  UpdateSongRequest,
  UpdateSongResponse
} from '@shared/song/api';
import type { Song } from '@shared/song/types';

const DATA_PATH = join(process.cwd(), 'data');
const SONGS_PATH = join(DATA_PATH, 'songs');

async function ensureSongsDirectory() {
  if (!existsSync(DATA_PATH)) {
    await mkdir(DATA_PATH, { recursive: true });
  }
  if (!existsSync(SONGS_PATH)) {
    await mkdir(SONGS_PATH, { recursive: true });
  }
}

async function getAllSongs(req: Request, res: Response<GetSongsResponse>) {
  try {
    await ensureSongsDirectory();
    const entries = await readdir(SONGS_PATH, { withFileTypes: true });
    const folders = entries.filter(e => e.isDirectory());
    const songs: Song[] = await Promise.all(
      folders.map(async (folder) => {
        const uid = folder.name;
        const infoPath = join(SONGS_PATH, uid, 'info.json');
        try {
          const content = await readFile(infoPath, 'utf-8');
          const info = JSON.parse(content);
          return { uid, info } as Song;
        } catch {
          return null;
        }
      })
    ).then((arr): Song[] => arr.filter((s): s is Song => s !== null));
    res.json({ success: true, data: { songs } });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

async function getSong(req: Request<{ uid: string }>, res: Response<GetSongResponse>) {
  const { uid } = req.params;
  try {
    await ensureSongsDirectory();
    const infoPath = join(SONGS_PATH, uid, 'info.json');
    const content = await readFile(infoPath, 'utf-8');
    const info = JSON.parse(content);
    res.json({ success: true, data: { song: { uid, info } } });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Song not found' });
  }
}

async function addSong(req: Request<{}, {}, AddSongRequest>, res: Response<AddSongResponse>) {
  try {
    await ensureSongsDirectory();
    // Ici, on suppose que le front envoie info: { name, duration, ... }
    const { info } = req.body as any;
    const uid = Math.random().toString(36).slice(2, 10);
    const songDir = join(SONGS_PATH, uid);
    if (!existsSync(songDir)) {
      await mkdir(songDir, { recursive: true });
    }
    const infoPath = join(songDir, 'info.json');
    await writeFile(infoPath, JSON.stringify(info, null, 2), 'utf-8');
    res.json({ success: true, data: { song: { uid, info } } });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

async function updateSong(req: Request<{}, {}, UpdateSongRequest>, res: Response<UpdateSongResponse>) {
  try {
    const { uid, info } = req.body;
    await ensureSongsDirectory();
    const infoPath = join(SONGS_PATH, uid, 'info.json');
    await writeFile(infoPath, JSON.stringify(info, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

export function createSongRouter() {
  const router = Router();
  router.get('/', getAllSongs);
  router.get('/:uid', getSong);
  router.post('/', addSong);
  router.put('/', updateSong);
  return router;
}
