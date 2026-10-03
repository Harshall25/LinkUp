const express = require('express');
const userRouter = express.Router();
const { socialLimiter } = require('../middlewares/rateLimiter');
const { userAuth, optionalAuth } = require('../middlewares/userAuth');
const { isObjectId } = require('../utils/validation');

const {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    searchUsers,
    getSuggestedUsers,
    getCurrentUser
} = require('../controllers/userController');

userRouter.param('userId', (req, res, next, id) => {
    if (!isObjectId(id)) return res.status(404).json({ error: 'User not found' });
    next();
});

// Search users (public; follow state included when signed in)
userRouter.get('/search', optionalAuth, searchUsers);

// Get suggested users to follow (protected)
userRouter.get('/suggested', userAuth, getSuggestedUsers);

// Get current user profile (protected)
userRouter.get('/me', userAuth, getCurrentUser);

// Follow/unfollow routes (protected)
userRouter.post('/:userId/follow', socialLimiter, userAuth, followUser);
userRouter.delete('/:userId/follow', socialLimiter, userAuth, unfollowUser);

// Get followers/following lists (public)
userRouter.get('/:userId/followers', getFollowers);
userRouter.get('/:userId/following', getFollowing);

module.exports = {
    userRouter
};
