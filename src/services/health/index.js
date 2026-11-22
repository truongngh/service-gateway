import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

export default {
  name: 'health',
  basePath: '/services/health',
  router,
};
