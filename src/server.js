import 'dotenv/config';
import express from 'express';
import { loadServices, registry } from './registry.js';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Auto-load and mount every pluggable service under its own path prefix.
await loadServices();
for (const s of registry.list()) {
  app.use(s.basePath, s.router);
  console.log(`[gateway] mounted "${s.name}" -> ${s.basePath}`);
}

// Root route = live registry / mini dashboard.
app.get('/', (_req, res) => {
  res.json({
    gateway: 'service-gateway',
    version: '1.0.0',
    services: registry.list().map((s) => ({ name: s.name, basePath: s.basePath })),
  });
});

// Catch-all for unknown paths.
app.use((req, res) => {
  res.status(404).json({ error: 'not found', path: req.path });
});

const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`[gateway] listening on :${port}`));
