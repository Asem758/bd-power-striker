import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './routes';

export async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Body parsing middleware with higher limit for image base64 uploads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Static uploads directory for media, match screenshots, and squad photos
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Also serve public folder for static assets (e.g. logos, badges)
  const publicDir = path.join(process.cwd(), 'public');
  app.use(express.static(publicDir));

  // API Routes
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', club: 'BD Power Strikers Club', timestamp: new Date().toISOString() });
  });

  // Catch-all for undefined /api routes so they return JSON 404 instead of Vite SPA HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  // Vite integration (disabled in production)
  if (process.env.NODE_ENV !== 'production') {
    // Explicitly disable HMR in Vite dev server to prevent websocket connection errors in iframe
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BDPSC Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

// Auto-start when executed directly
startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
