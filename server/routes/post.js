const express = require('express');
const postRouter = express.Router();
const { postLimiter, socialLimiter } = require('../middlewares/rateLimiter');
const { userAuth, optionalAuth } = require('../middlewares/userAuth');
const { isObjectId } = require('../utils/validation');

const {
    createPost,
    deletePost,
    renderPost,
    renderbyId,
    updatePost,
    addComment,
    getComments,
    likePost,
    unlikePost,
    getTrendingHashtags
} = require('../controllers/postController');

postRouter.param('id', (req, res, next, id) => {
    if (!isObjectId(id)) return res.status(404).json({ error: 'Post not found' });
    next();
});

// Trending hashtags
postRouter.get('/trending/hashtags', getTrendingHashtags);

// Post routes
postRouter.post('/create', postLimiter, userAuth, createPost);
postRouter.get('/', optionalAuth, renderPost);
postRouter.get('/:id', optionalAuth, renderbyId);
postRouter.patch('/:id', userAuth, updatePost);
postRouter.delete('/:id', userAuth, deletePost);

// Comment routes
postRouter.post('/:id/comments', userAuth, addComment);
postRouter.get('/:id/comments', getComments);

// Like routes
postRouter.post('/:id/like', socialLimiter, userAuth, likePost);
postRouter.delete('/:id/like', socialLimiter, userAuth, unlikePost);

module.exports = {
    postRouter
};
