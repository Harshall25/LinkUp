const express = require('express');
const authRouter = express.Router();
const { authLimiter } = require('../middlewares/rateLimiter');
const { userModel } = require('../schema');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const { OAuth2Client } = require('google-auth-library');
const { signToken } = require('../middlewares/userAuth');
const { zodMessage, exactMatch } = require('../utils/validation');

const googleClient = new OAuth2Client();

const signupSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(60, "Name must be 60 characters or fewer"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").max(128)
});

const signinSchema = z.object({
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required")
});

const googleSchema = z.object({
    credential: z.string().min(1, "Missing Google credential")
});

// Older accounts were stored with the email exactly as typed.
const findByEmail = (email) => userModel.findOne({ email: exactMatch(email) });

const toPublicUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar || null
});

const sendSession = (res, status, user) =>
    res.status(status).json({ success: true, token: signToken(user._id), user: toPublicUser(user) });

// The Google client ID is public; serving it at runtime keeps it configured
// in one place (the server env) instead of also baking it into the client build.
authRouter.get('/config', (req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || null });
});

authRouter.post('/signup', authLimiter, async function (req, res) {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: zodMessage(parsed.error) });
    }
    try {
        const { name, password } = parsed.data;
        const email = parsed.data.email.toLowerCase();

        if (await findByEmail(email)) {
            return res.status(409).json({ error: "An account with this email already exists" });
        }

        const user = await userModel.create({
            name,
            email,
            password: await bcrypt.hash(password, 10),
        });

        sendSession(res, 201, user);
    } catch (error) {
        console.error('Signup failed:', error);
        res.status(500).json({ error: "Could not create your account. Please try again." });
    }
});

authRouter.post('/signin', authLimiter, async function (req, res) {
    const parsed = signinSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: zodMessage(parsed.error) });
    }
    try {
        const { email, password } = parsed.data;
        const user = await findByEmail(email);

        if (user && !user.password) {
            return res.status(400).json({ error: "This account uses Google sign-in. Continue with Google instead." });
        }
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Incorrect email or password" });
        }

        sendSession(res, 200, user);
    } catch (error) {
        console.error('Signin failed:', error);
        res.status(500).json({ error: "Could not sign you in. Please try again." });
    }
});

authRouter.post('/google', authLimiter, async function (req, res) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        return res.status(503).json({ error: "Google sign-in is not configured" });
    }
    const parsed = googleSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: zodMessage(parsed.error) });
    }

    let profile;
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: parsed.data.credential, audience: clientId });
        profile = ticket.getPayload();
    } catch {
        return res.status(401).json({ error: "Google sign-in failed. Please try again." });
    }
    if (!profile?.email || !profile.email_verified) {
        return res.status(401).json({ error: "Your Google account email is not verified" });
    }

    try {
        let user = await userModel.findOne({ googleId: profile.sub }) || await findByEmail(profile.email);

        if (user) {
            // Link Google to an existing email/password account with the same verified email.
            if (!user.googleId) user.googleId = profile.sub;
            if (!user.avatar && profile.picture) user.avatar = profile.picture;
            if (user.isModified()) await user.save();
            return sendSession(res, 200, user);
        }

        user = await userModel.create({
            name: profile.name || profile.email.split('@')[0],
            email: profile.email.toLowerCase(),
            googleId: profile.sub,
            avatar: profile.picture,
        });
        sendSession(res, 201, user);
    } catch (error) {
        console.error('Google signin failed:', error);
        res.status(500).json({ error: "Could not sign you in. Please try again." });
    }
});

module.exports = {
    authRouter
};
