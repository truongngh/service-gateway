import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadServices, registry } from './registry.js';

test('services auto-register and expose valid manifests', async () => {
  await loadServices();
  const services = registry.list();

  assert.ok(services.length > 0, 'at least one service should register');

  for (const s of services) {
    assert.ok(typeof s.name === 'string' && s.name.length > 0, 'service needs a name');
    assert.ok(typeof s.basePath === 'string' && s.basePath.startsWith('/'), 'service needs a basePath');
    assert.ok(s.router, 'service needs a router');
  }

  const names = services.map((s) => s.name);
  assert.ok(names.includes('health'), 'health service present');
  assert.ok(names.includes('text'), 'text service present');
  assert.ok(names.includes('models'), 'models service present');
});
