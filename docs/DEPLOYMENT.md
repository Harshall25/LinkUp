# Deployment — Vercel (frontend + backend, one project)

Both the React client and the Express backend deploy as a **single Vercel project**. The client is served as a static SPA out of `client/dist`; the backend runs on Vercel's serverless runtime as one function that wraps the whole Express app.

```
GitHub repo (one project)
        │
        ▼
     Vercel
      │  │
      │  └── /api/*    →  api/[[...path]].js  →  Express (server/server.js)
      │
      └── everything else → client/dist (Vite static build)
```

Because both live under one domain (e.g. `linkup.vercel.app`), the browser calls `/api/v1/...` on that same origin — **no CORS crossing at all in production**.

## What ships where

| File | Role |
| --- | --- |
| [vercel.json](../vercel.json) | Build command, output directory, rewrites, function config |
| [api/[[...path]].js](../api/[[...path]].js) | Catch-all serverless entry — re-exports the Express app |
| [server/server.js](../server/server.js) | Express app definition; only calls `app.listen()` when not on Vercel |
| [server/config/database.js](../server/config/database.js) | Cached Mongo connection so warm invocations reuse the socket |
| [package.json](../package.json) (root) | Backend deps at repo root so Vercel installs them once |

## One-time setup

### 1. Push the repo to GitHub

Just needs to exist as a remote — Vercel connects to it.

### 2. Import on Vercel

- [vercel.com/new](https://vercel.com/new)
- Pick this repo
- Framework preset: **Other** (or leave "Detected: Vite" — the `buildCommand` in `vercel.json` overrides anyway)
- Root Directory: leave as `.` (the repo root)
- Build & Output Settings: leave blank; `vercel.json` sets them
- Click Deploy

### 3. Set environment variables in Vercel

Project → Settings → Environment Variables. At minimum:

| Var | Where used | Example |
| --- | --- | --- |
| `MONGODB_URI` | `server/config/database.js` | `mongodb+srv://user:pass@cluster.mongodb.net/linkup` |
| `JWT_SECRET` | `server/middlewares/*` | any long random string |
| `R2_ACCOUNT_ID` | `server/config/r2.js` | Cloudflare R2 account id |
| `R2_ACCESS_KEY_ID` | R2 uploads | |
| `R2_SECRET_ACCESS_KEY` | R2 uploads | |
| `R2_BUCKET_NAME` | R2 uploads | |
| `R2_PUBLIC_URL` | R2 uploads | |

Add them for **Production**, **Preview**, and **Development** as appropriate. **Don't** put `VERCEL=1` — Vercel sets that itself, and [server/server.js:52](../server/server.js#L52) uses it to skip `app.listen()`.

### 4. First deploy

Vercel deploys immediately on import. After that, every push to `main` deploys production automatically, and every PR branch gets its own preview URL. **No GitHub Actions workflow needed for deploy** — Vercel's GitHub app handles it.

## Local dev

Two terminals:

```bash
# Backend on :8080
cd server && npm run dev

# Vite dev server on :5173, proxying /api → :8080
cd client && npm run dev
```

Axios in [client/src/api/axios.js](../client/src/api/axios.js) defaults to `/api/v1`. The Vite proxy in [client/vite.config.js](../client/vite.config.js) forwards `/api/*` to the backend, so the dev origin is same-origin too.

If you'd rather run both under the Vercel emulator:

```bash
npm i -g vercel
vercel dev
```

This runs the serverless function locally alongside the static build, exactly as production would.

## CI

[.github/workflows/ci.yml](../.github/workflows/ci.yml) still runs on every push / PR and just builds the client + syntax-checks the server. It never deploys. Vercel is the deploy trigger; GitHub Actions is only there so a broken build shows up as a red check before Vercel has a chance to fail the deploy.

## Gotchas

- **Rate limiter**: `express-rate-limit`'s default memory store resets on every cold start. If you need real rate limiting on Vercel, switch to an external store (Upstash Redis, etc.). Fine for MVP.
- **`multer`** uses in-memory storage on Vercel; response streaming and >4.5 MB uploads can hit function limits. R2 uploads use presigned URLs from the client where possible.
- **Cold starts**: the first request after a period of idle takes an extra 500-1500ms while Mongo connects. Subsequent requests reuse the cached connection.
