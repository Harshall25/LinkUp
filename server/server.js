require('dotenv').config();
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

// Middleware
app.use(cors());
app.use(express.json());

// Apply general rate limiting to all routes
app.use('/api/', generalLimiter);

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter); // User follow/unfollow endpoints
app.use('/api/v1/media', mediaRouter); // R2 media upload endpoints

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
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
