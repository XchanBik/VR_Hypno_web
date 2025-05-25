import { Router } from 'express';
import { Message, ApiResponse } from '@shared/types';

export function createMessageRouter() {
  const router = Router();

  router.get('/', (req, res) => {
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

  return router;
} 