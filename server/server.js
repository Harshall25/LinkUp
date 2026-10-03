require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const { generalLimiter } = require('./middlewares/rateLimiter');

// Routes import
const { authRouter } = require('./routes/auth');
const { postRouter } = require('./routes/post');
const { userRouter } = require('./routes/user'); // User follow/unfollow routes
const { mediaRouter } = require('./routes/media'); // R2 media upload routes

const app = express();

// Vercel (and the Vite dev proxy) sit in front of Express. Without this,
// req.ip is the proxy's address and every visitor shares one rate-limit bucket.
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Apply general rate limiting to all routes
app.use('/api/', generalLimiter);

// Media routes only talk to R2, so they don't wait on MongoDB.
app.use('/api/v1/media', mediaRouter);

// Serverless instances can start before (or lose) the Mongo connection.
// Awaiting the cached connection here turns that into a fast retry instead of
// a 10s mongoose buffering timeout.
app.use('/api/', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch {
        res.status(503).json({ error: 'Service temporarily unavailable. Please try again.' });
    }
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter); // User follow/unfollow endpoints

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        error: status === 500 ? 'Something went wrong!' : err.message
    });
});

// Kick off DB connection at boot. On Vercel this happens on cold start; the
// mongoose connection is cached in config/database.js and reused across warm
// invocations. Failures log but do not kill the process — subsequent requests
// will retry via connectDB().
connectDB().catch((err) => console.error('Initial DB connect failed:', err));

// Only bind a port when running as a long-lived server (local dev, Cloud Run,
// or any container host). On Vercel VERCEL=1 is set, so we skip listen()
// and just export the app for the serverless wrapper.
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 8080;
    const HOST = '0.0.0.0';
    app.listen(PORT, HOST, () => {
        console.log(`Server is running on ${HOST}:${PORT}`);
    });
}

module.exports = app;
