import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Peek at ../server/.env so a PORT change on the server automatically
// reroutes the Vite dev proxy — no need to keep two configs in sync.
function readServerPort() {
  try {
    const envPath = resolve(__dirname, '../server/.env');
    const content = readFileSync(envPath, 'utf8');
    const match = content.match(/^\s*PORT\s*=\s*(\d+)/m);
    if (match) return Number.parseInt(match[1], 10);
  } catch {
    // no server/.env — that's fine, fall back to default
  }
  return null;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const detectedPort = readServerPort();
  const proxyTarget =
    env.VITE_DEV_PROXY_TARGET ||
    (detectedPort ? `http://localhost:${detectedPort}` : 'http://localhost:8080');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
