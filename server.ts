import express from 'express';
import path from 'path';
import { apiRouter } from './src/server/api.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Serve static frontend assets
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA client-side routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`QuizMaster Server running on port ${PORT}`);
});
