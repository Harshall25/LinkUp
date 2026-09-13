# CI / CD

## GitHub Actions

The pipeline lives in [.github/workflows/ci.yml](../.github/workflows/ci.yml) and runs on every push and PR to `main`.

Two jobs run in parallel:

### `client`

Builds the Vite frontend from the `client/` directory.

Steps:
1. Checkout
2. Setup Node 20 with npm cache keyed to `client/package-lock.json`
3. `npm ci`
4. `npm run lint` (`continue-on-error: true` — the existing codebase still has warnings; the check runs but doesn't gate the build)
5. `npm run build`
6. Upload `client/dist` as an artifact for 7 days

The `working-directory: client` default in the job keeps every step scoped to the frontend without repeating the path.

### `server`

Sanity-checks the Express server.

Steps:
1. Checkout
2. Setup Node 20
3. `npm ci` (falls back to `npm install` if there's no lockfile yet)
4. `node --check server.js` — parses without executing so we catch syntax errors
5. Placeholder for real tests

## Making lint a hard gate

Once the client lint output is clean, drop the `continue-on-error: true` line under the "Lint" step. Do the same for the server once a test runner is wired up.

## Adding tests

For the server, drop a test runner into `server/package.json` (`node --test`, Vitest, or Jest are all fine) and replace the placeholder step:

```yaml
- name: Test
  run: npm test
```

For the client, add Vitest + React Testing Library and swap in `npm run test` before the build step.

## Secrets

The current pipeline needs no secrets. When we add deployment (see [DEPLOYMENT.md](DEPLOYMENT.md)), Vercel / Netlify tokens live in **Settings → Secrets and variables → Actions** and are referenced as `${{ secrets.NAME }}` — never commit them.
