// Vercel serverless entry point.
//
// The double-square-bracket catch-all filename makes this file the handler
// for every /api/* request. Vercel does not strip the /api prefix from the
// URL that reaches the function, so the Express app matches its own routes
// (e.g. /api/v1/auth/login) directly.
module.exports = require('../server/server.js');
