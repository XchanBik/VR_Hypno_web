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

// API Routes
app.use(createMainRouter());

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, '../front')));

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 