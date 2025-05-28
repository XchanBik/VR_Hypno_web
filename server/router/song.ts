import { Router, Request, Response } from 'express';
import { join } from 'path';
import { readdir, readFile, mkdir, writeFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import multer from 'multer';
import { parseFile } from 'music-metadata';
import type {
  GetSongsResponse,
  GetSongResponse,
  AddSongRequest,
  AddSongResponse,
  UpdateSongRequest,
  UpdateSongResponse,
  DeleteSongResponse
} from '@shared/song/api';
import type { Song, SongInfo } from '@shared/song/types';

const DATA_PATH = join(process.cwd(), 'data');
const SONGS_PATH = join(DATA_PATH, 'songs');
const SESSIONS_PATH = join(DATA_PATH, 'sessions');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uid = req.params.uid;
      const songDir = join(SONGS_PATH, uid);
      await ensureSongsDirectory();
      if (!existsSync(songDir)) {
        await mkdir(songDir, { recursive: true });
      }
      cb(null, songDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    cb(null, 'audio.mp3');
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 files are allowed'));
    }
  },
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
  }
});

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
    const songs: Song[] = (await Promise.all(
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
    ))
      .filter((s): s is Song => s !== null)
      .sort((a: Song, b: Song) => a.info.name.localeCompare(b.info.name));
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
    const { info } = req.body;
    const uid = Math.random().toString(36).slice(2, 10);
    const songDir = join(SONGS_PATH, uid);
    
    if (!existsSync(songDir)) {
      await mkdir(songDir, { recursive: true });
    }

    // Save the song info
    const infoPath = join(songDir, 'info.json');
    await writeFile(infoPath, JSON.stringify(info, null, 2), 'utf-8');

    res.json({ success: true, data: { song: { uid, info } } });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

// New endpoint for file upload
async function uploadSongFile(req: Request<{ uid: string }>, res: Response) {
  try {
    const { uid } = req.params;
    const songDir = join(SONGS_PATH, uid);
    
    if (!existsSync(songDir)) {
      await mkdir(songDir, { recursive: true });
    }

    if (!req.file) {
      throw new Error('No file uploaded');
    }

    // Get duration using music-metadata
    const metadata = await parseFile(req.file.path);
    const duration = Math.round(metadata.format.duration || 0);

    // Update song info with duration
    const infoPath = join(songDir, 'info.json');
    const content = await readFile(infoPath, 'utf-8');
    const info: SongInfo = JSON.parse(content);
    info.duration = duration;
    await writeFile(infoPath, JSON.stringify(info, null, 2), 'utf-8');

    res.json({ success: true });
  } catch (error) {
    console.error('Upload error:', error);
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

async function deleteSong(req: Request<{ uid: string }>, res: Response<DeleteSongResponse>) {
  try {
    const { uid } = req.params;
    const songDir = join(SONGS_PATH, uid);

    // Check if song exists
    if (!existsSync(songDir)) {
      return res.status(404).json({ success: false, error: 'Song not found' });
    }

    // Check if song is used in any session
    const sessionEntries = await readdir(SESSIONS_PATH, { withFileTypes: true });
    const sessionFolders = sessionEntries.filter(e => e.isDirectory());
    
    for (const folder of sessionFolders) {
      const infoPath = join(SESSIONS_PATH, folder.name, 'info.json');
      try {
        const content = await readFile(infoPath, 'utf-8');
        const info = JSON.parse(content);
        if (info.song_uid === uid) {
          return res.status(400).json({ 
            success: false, 
            error: 'Cannot delete song: it is being used in one or more sessions' 
          });
        }
      } catch {
        continue;
      }
    }

    // Delete the song directory
    await rm(songDir, { recursive: true, force: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

// Streaming endpoint for audio
async function streamSongFile(req: Request<{ uid: string }>, res: Response) {
  try {
    const { uid } = req.params;
    const songDir = join(SONGS_PATH, uid);
    const audioPath = join(songDir, 'audio.mp3');
    if (!existsSync(audioPath)) {
      return res.status(404).json({ success: false, error: 'Audio file not found' });
    }
    const stat = await import('fs').then(fs => fs.statSync(audioPath));
    const range = req.headers.range;
    if (!range) {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'audio/mpeg',
      });
      import('fs').then(fs => fs.createReadStream(audioPath).pipe(res));
      return;
    }
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunkSize = end - start + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/mpeg',
    });
    import('fs').then(fs => fs.createReadStream(audioPath, { start, end }).pipe(res));
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

export function createSongRouter() {
  const router = Router();
  router.get('/', getAllSongs);
  router.get('/:uid', getSong);
  router.post('/', addSong);
  router.post('/:uid/upload', upload.single('audio'), uploadSongFile);
  router.put('/', updateSong);
  router.delete('/:uid', deleteSong);
  router.get('/:uid/stream', streamSongFile);
  return router;
}
