# service-gateway

A pluggable gateway that mounts **self-registering services** under their own
path prefixes in a single Node.js process, and talks to your **local LLMs**
(Ollama). Designed to be containerized, stored in a registry, and run locally.

## How extensibility works
Each service is a folder `src/services/<name>/index.js` that exports a manifest:

```js
export default {
  name: 'text',
  basePath: '/services/text',
  router, // an Express Router
};
```

`src/registry.js` auto-discovers every subfolder and mounts its router at
`basePath`. **Adding a service = adding a folder.** No central wiring.
The root route `GET /` lists every registered service.

## Services (seed)
| Service | Path | What it does |
|---|---|---|
| `health` | `/services/health/health` | liveness check |
| `text` | `/services/text/generate` | chat/completion via local Ollama |
| `models` | `/services/models` | list local models (proxies Ollama `/api/tags`) |
| `image` | `/services/image` | extensible stub for a local image model |

## Local dev
```bash
cp .env.example .env
npm install
npm run dev          # or: npm start
npm test
```

## Container (Docker)
```bash
docker build -t service-gateway .
docker run --rm -p 8080:8080 service-gateway
```

## Verify
```bash
curl -s localhost:8080/                                   # list services
curl -s localhost:8080/services/health/health             # {"status":"ok"}
curl -s -X POST localhost:8080/services/text/generate \
  -H 'content-type: application/json' \
  -d '{"model":"qwen3.8:27b","prompt":"say hi"}'
```

## Build pipeline
`.github/workflows/build-and-push.yml` runs on push to `main`:
`test -> build image -> push to ghcr.io/<owner>/service-gateway`.
Pull and run:
```bash
docker pull ghcr.io/truongngh/service-gateway:main
docker run --rm -p 8080:8080 ghcr.io/truongngh/service-gateway:main
```

## Environment
| Var | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | listen port |
| `OLLAMA_BASE_URL` | `http://host.docker.internal:11434` | local Ollama |
| `DEFAULT_TEXT_MODEL` | `qwen3.8:27b` | default model |
| `IMAGE_SERVICE_URL` | — | local image model (stub) |

> `host.docker.internal` reaches the host on macOS Docker Desktop. On Linux,
> add `--add-host=host.docker.internal:host-gateway`.
