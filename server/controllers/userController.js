const { userModel } = require('../schema');
const { escapeRegex } = require('../utils/validation');

const PUBLIC_FIELDS = 'name email avatar';

const serverError = (res, error) => {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
};

// Follow/unfollow are idempotent so a stale button state can't produce an error.
const followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.userId;

        if (userId === currentUserId) {
            return res.status(400).json({ error: 'You cannot follow yourself' });
        }
        if (!(await userModel.exists({ _id: userId }))) {
            return res.status(404).json({ error: 'User not found' });
        }

        await Promise.all([
            userModel.updateOne({ _id: currentUserId }, { $addToSet: { following: userId } }),
            userModel.updateOne({ _id: userId }, { $addToSet: { followers: currentUserId } })
        ]);

        res.status(200).json({ message: 'Successfully followed user', following: true });
    } catch (error) {
        serverError(res, error);
    }
};

const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.userId;

        if (userId === currentUserId) {
            return res.status(400).json({ error: 'You cannot unfollow yourself' });
        }
        if (!(await userModel.exists({ _id: userId }))) {
            return res.status(404).json({ error: 'User not found' });
        }

        await Promise.all([
            userModel.updateOne({ _id: currentUserId }, { $pull: { following: userId } }),
            userModel.updateOne({ _id: userId }, { $pull: { followers: currentUserId } })
        ]);

        res.status(200).json({ message: 'Successfully unfollowed user', following: false });
    } catch (error) {
        serverError(res, error);
    }
};

// Get followers of a user
const getFollowers = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userId)
            .populate('followers', PUBLIC_FIELDS)
            .select('followers');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            count: user.followers.length,
            followers: user.followers
        });
    } catch (error) {
        serverError(res, error);
    }
};

// Get users that a user is following
const getFollowing = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userId)
            .populate('following', PUBLIC_FIELDS)
            .select('following');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            count: user.following.length,
            following: user.following
        });
    } catch (error) {
        serverError(res, error);
    }
};

// Search users by name or email
const searchUsers = async (req, res) => {
    try {
        const q = String(req.query.q || '').trim().replace(/^@/, '');

        if (q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const pattern = new RegExp(escapeRegex(q), 'i');
        const [users, viewer] = await Promise.all([
            userModel.find({ $or: [{ name: pattern }, { email: pattern }] })
                .select(PUBLIC_FIELDS)
                .limit(20),
            req.userId ? userModel.findById(req.userId).select('following') : null
        ]);

        const following = new Set((viewer?.following || []).map(String));
        res.status(200).json({
            success: true,
            count: users.length,
            users: users.map((user) => ({
                ...user.toJSON(),
                isSelf: user._id.toString() === req.userId,
                isFollowing: following.has(user._id.toString())
            }))
        });
    } catch (error) {
        serverError(res, error);
    }
};

// Get suggested users to follow (users not currently following, excluding self)
const getSuggestedUsers = async (req, res) => {
    try {
        const currentUser = await userModel.findById(req.userId).select('following');
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const suggestedUsers = await userModel.find({
            _id: { $ne: req.userId, $nin: currentUser.following }
        })
            .select(PUBLIC_FIELDS)
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            count: suggestedUsers.length,
            users: suggestedUsers
        });
    } catch (error) {
        serverError(res, error);
    }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId)
            .select('name email avatar following followers createdAt');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || null,
                following: user.following.length,
                followers: user.followers.length,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        serverError(res, error);
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    searchUsers,
    getSuggestedUsers,
    getCurrentUser
};
