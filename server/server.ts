import express from 'express';
import path from 'path';
import { Message, ApiResponse } from '../shared/types';

const app = express();
const port = 13337;

app.use(express.json());

// API Routes
app.get('/api/message', (req, res) => {
  const message: Message = {
    id: 1,
    content: 'Hello from the server!',
    timestamp: new Date()
  };

  const response: ApiResponse<Message> = {
    success: true,
    data: message
  };

  res.json(response);
});

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, '../front')));

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 