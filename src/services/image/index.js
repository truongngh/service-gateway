import { Router } from 'express';

// Extensible stub: wire this to a local image model via IMAGE_SERVICE_URL
// (e.g. an Ollama image model or another local generation server).
const router = Router();

router.get('/', (_req, res) => {
  res.json({
    name: 'image',
    status: 'stub',
    note: 'wire this to a local image model via IMAGE_SERVICE_URL',
    config: { imageServiceUrl: process.env.IMAGE_SERVICE_URL || null },
  });
});

export default {
  name: 'image',
  basePath: '/services/image',
  router,
};
