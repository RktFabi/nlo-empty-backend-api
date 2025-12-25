import { FastifyCorsOptions } from '@fastify/cors';

export const corsOptions: FastifyCorsOptions = {
  origin: [
    '*', // Allow all origins - adjust as needed for production - This must be changed in production
    // 'http://localhost:3000',
    // 'http://127.0.0.1:3000',
    // 'https://your-production-domain.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};
