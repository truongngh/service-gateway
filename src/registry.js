import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';

// Auto-discovery: every subfolder of services/ that exports a valid manifest
// is mounted automatically. Adding a service = adding a folder; no wiring here.
const dir = join(dirname(fileURLToPath(import.meta.url)), 'services');

const registry = {
  _items: [],
  register(item) {
    this._items.push(item);
    return item;
  },
  list() {
    return this._items;
  },
};

export async function loadServices() {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    let mod;
    try {
      mod = await import(pathToFileURL(join(dir, entry.name, 'index.js')));
    } catch (e) {
      console.warn(`[gateway] failed to load service "${entry.name}": ${e.message}`);
      continue;
    }
    const svc = mod.default ?? mod.service;
    if (!svc?.basePath || !svc.router) {
      console.warn(`[gateway] skipping "${entry.name}": missing basePath or router`);
      continue;
    }
    registry.register(svc);
  }
}

export { registry };
