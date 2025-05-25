import { Router, Request, Response } from 'express';
import { join } from 'path';
import { readdir, readFile, mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import type {
  GetSessionsResponse,
  GetSessionResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  UpdateSessionRequest,
  UpdateSessionResponse
} from '@shared/session/api';
import type { Session } from '@shared/session/types';

const DATA_PATH = join(process.cwd(), 'data');
const SESSIONS_PATH = join(DATA_PATH, 'sessions');

async function ensureSessionsDirectory() {
  if (!existsSync(DATA_PATH)) {
    await mkdir(DATA_PATH, { recursive: true });
  }
  if (!existsSync(SESSIONS_PATH)) {
    await mkdir(SESSIONS_PATH, { recursive: true });
  }
}

async function getAllSessions(req: Request, res: Response<GetSessionsResponse>) {
  try {
    await ensureSessionsDirectory();
    const entries = await readdir(SESSIONS_PATH, { withFileTypes: true });
    const folders = entries.filter(e => e.isDirectory());
    const sessions: Session[] = await Promise.all(
      folders.map(async (folder) => {
        const uid = folder.name;
        const infoPath = join(SESSIONS_PATH, uid, 'info.json');
        try {
          const content = await readFile(infoPath, 'utf-8');
          const info = JSON.parse(content);
          return { uid, info } as Session;
        } catch {
          return null;
        }
      })
    ).then((arr): Session[] => arr.filter((s): s is Session => s !== null));
    res.json({ success: true, data: { sessions } });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

async function getSession(req: Request<{ uid: string }>, res: Response<GetSessionResponse>) {
  const { uid } = req.params;
  try {
    await ensureSessionsDirectory();
    const infoPath = join(SESSIONS_PATH, uid, 'info.json');
    const content = await readFile(infoPath, 'utf-8');
    const info = JSON.parse(content);
    res.json({ success: true, data: { session: { uid, info } } });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Session not found' });
  }
}

async function createSession(req: Request<{}, {}, CreateSessionRequest>, res: Response<CreateSessionResponse>) {
  try {
    await ensureSessionsDirectory();
    const uid = Math.random().toString(36).slice(2, 10);
    const sessionDir = join(SESSIONS_PATH, uid);
    if (!existsSync(sessionDir)) {
      await mkdir(sessionDir, { recursive: true });
    }
    const infoPath = join(sessionDir, 'info.json');
    await writeFile(infoPath, JSON.stringify(req.body.info, null, 2), 'utf-8');
    res.json({ success: true, data: { session: { uid, info: req.body.info } } });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

async function updateSession(req: Request<{}, {}, UpdateSessionRequest>, res: Response<UpdateSessionResponse>) {
  try {
    const { uid, info } = req.body;
    await ensureSessionsDirectory();
    const infoPath = join(SESSIONS_PATH, uid, 'info.json');
    await writeFile(infoPath, JSON.stringify(info, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

export function createSessionRouter() {
  const router = Router();
  router.get('/', getAllSessions);
  router.get('/:uid', getSession);
  router.post('/', createSession);
  router.put('/', updateSession);
  return router;
} 