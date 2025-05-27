import express from 'express';
import path from 'path';
import fs from 'fs';
import { createMainRouter } from './router';

const app = express();
const port = 8481;

// Ensure data directory exists at project root
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err: Error, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// API Routes
app.use(createMainRouter());

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, '../front')));

// VR Player route
app.get('/vrplayer/:uid', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/vrplayer.html'));
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 