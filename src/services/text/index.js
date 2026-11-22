import { Router } from 'express';

// Talks to a local Ollama server. From a container on macOS Docker Desktop,
// the host is reachable at host.docker.internal. Override via OLLAMA_BASE_URL.
const OLLAMA = process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434';
const DEFAULT_MODEL = process.env.DEFAULT_TEXT_MODEL || 'qwen3.8:27b';

const router = Router();

// POST /services/text/generate  { model?, prompt?, messages?, stream? }
router.post('/generate', async (req, res) => {
  const { model, prompt, messages } = req.body || {};
  if (!prompt && !messages) {
    return res.status(400).json({ error: 'prompt or messages required' });
  }
  try {
    const r = await fetch(`${OLLAMA}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages: messages || [{ role: 'user', content: prompt }],
        stream: false,
      }),
    });
    const data = await r.json();
    res.json({ model: data.model, response: data.message?.content ?? data.error });
  } catch (e) {
    res.status(502).json({ error: 'ollama unreachable', detail: e.message });
  }
});

export default {
  name: 'text',
  basePath: '/services/text',
  router,
};
