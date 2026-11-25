import { Router } from 'express';

// Lists the local models Ollama has, proxying /api/tags so clients (e.g.
// service-ui) can talk to the gateway alone — no direct Ollama dependency.
const OLLAMA = process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434';

const router = Router();

// GET /services/models  -> { models: [{ name, size }] }
router.get('/', async (_req, res) => {
  try {
    const r = await fetch(`${OLLAMA}/api/tags`);
    const data = await r.json();
    res.json({ models: (data.models || []).map((m) => ({ name: m.name, size: m.size })) });
  } catch (e) {
    res.status(502).json({ error: 'ollama unreachable', detail: e.message });
  }
});

export default {
  name: 'models',
  basePath: '/services/models',
  router,
};
