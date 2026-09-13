const mongoose = require('mongoose');

// Cache the connection across warm serverless invocations. Vercel reuses the
// module scope between invocations of the same function instance, so this
// cache survives until the instance is recycled.
let cachedConn = null;
let inflightPromise = null;

const connectDB = async () => {
    if (cachedConn && mongoose.connection.readyState === 1) {
        return cachedConn;
    }
    if (inflightPromise) return inflightPromise;

    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-media';

    inflightPromise = mongoose
        .connect(MONGODB_URI)
        .then((conn) => {
            cachedConn = conn;
            inflightPromise = null;
            console.log('MongoDB connected');
            return conn;
        })
        .catch((error) => {
            inflightPromise = null;
            cachedConn = null;
            console.error('MongoDB connection error:', error);
            throw error;
        });

    return inflightPromise;
};

module.exports = { connectDB };
