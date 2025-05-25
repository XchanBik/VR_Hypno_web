import { Router } from 'express';
import { createPlaylistsRouter } from '@/router/playlist';
import { createSessionRouter } from '@/router/session';
import { createSongRouter } from '@/router/song';

export function createMainRouter() {
  const router = Router();

  // Middleware pour logger les requêtes
  router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Middleware pour gérer les erreurs
  router.use((err: Error, req: any, res: any, next: any) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  });

  // Routes API
  router.use('/api/playlists', createPlaylistsRouter());
  router.use('/api/sessions', createSessionRouter());
  router.use('/api/songs', createSongRouter());

  return router;
} 