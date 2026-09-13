// Vercel serverless entry point.
//
// vercel.json rewrites every /api/* request here. Vercel preserves the
// original request URL through a rewrite, so Express sees the real path
// (e.g. /api/v1/auth/signin) and matches its own mounted routers.
//
// The prefix guard below is defensive: if a future routing change ever
// strips the /api prefix, Express would 404 on every route. Re-adding it
// keeps the handler correct either way.
const app = require('../server/server.js');

module.exports = (req, res) => {
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`;
  }
  return app(req, res);
};
