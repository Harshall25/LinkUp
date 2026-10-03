const { postModel, commentModel, likeModel, userModel } = require('../schema');
const { z } = require('zod');
const { deleteFromR2 } = require('../config/r2');
const { extractMediaKey, isMediaUrl, toMediaUrl } = require('../utils/media');
const { zodMessage, escapeRegex, exactMatch, isObjectId, normalizeTags, extractHashtags } = require('../utils/validation');

const AUTHOR_FIELDS = 'name email avatar';
const SORTABLE_FIELDS = new Set(['createdAt', 'likesCount']);
const MAX_PAGE_SIZE = 50;

const mediaUrl = z.string().max(500)
    .transform(toMediaUrl)
    .refine(isMediaUrl, 'Attach media by uploading it first');

const createPostSchema = z.object({
    title: z.string().trim().max(200).optional(),
    content: z.string().trim().max(5000, 'Posts must be 5,000 characters or fewer').default(''),
    tags: z.array(z.string().max(60)).max(20).optional(),
    imageUrl: mediaUrl.optional()
}).refine((post) => post.content || post.imageUrl, { message: 'Write something or attach a photo or video' });

const updatePostSchema = z.object({
    title: z.string().trim().max(200).optional(),
    content: z.string().trim().min(1).max(5000).optional(),
    tags: z.array(z.string().max(60)).max(20).optional(),
    imageUrl: mediaUrl.optional()
});

const commentSchema = z.object({
    content: z.string().trim().min(1, "Comment can't be empty").max(1000, 'Comments must be 1,000 characters or fewer')
});

const serverError = (res, error) => {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
};

// Comment counts and the viewer's like state live in other collections; fetch
// them for the whole page in two queries rather than per post.
async function withViewerState(posts, viewerId) {
    if (posts.length === 0) return [];
    const ids = posts.map((post) => post._id);
    const [commentCounts, likedIds] = await Promise.all([
        commentModel.aggregate([
            { $match: { post: { $in: ids } } },
            { $group: { _id: '$post', count: { $sum: 1 } } }
        ]),
        viewerId ? likeModel.distinct('post', { post: { $in: ids }, user: viewerId }) : []
    ]);
    const counts = new Map(commentCounts.map((c) => [c._id.toString(), c.count]));
    const liked = new Set(likedIds.map(String));
    return posts.map((post) => ({
        ...post.toJSON(),
        commentsCount: counts.get(post._id.toString()) || 0,
        likedByMe: liked.has(post._id.toString())
    }));
}

async function syncLikesCount(postId) {
    const likesCount = await likeModel.countDocuments({ post: postId });
    await postModel.updateOne({ _id: postId }, { likesCount });
    return likesCount;
}

// Create post (protected)
const createPost = async (req, res) => {
    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: zodMessage(parsed.error) });
    }
    try {
        const { title, content, tags = [], imageUrl } = parsed.data;
        const post = await postModel.create({
            title,
            content,
            tags: normalizeTags([...extractHashtags(content), ...tags]),
            imageUrl,
            author: req.userId
        });
        await post.populate('author', AUTHOR_FIELDS);

        res.status(201).json({
            message: "Post created successfully",
            post: { ...post.toJSON(), commentsCount: 0, likedByMe: false }
        });
    } catch (error) {
        serverError(res, error);
    }
};

// Get all posts (public) with filtering and pagination
const renderPost = async (req, res) => {
    try {
        const { author, tags, search, sortBy = 'createdAt', sortOrder = 'desc', feedType } = req.query;
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), MAX_PAGE_SIZE);
        const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);

        const filter = {};

        if (author) {
            if (!isObjectId(author)) return res.status(400).json({ error: 'Invalid author' });
            filter.author = author;
        }

        if (tags) {
            const tagList = (Array.isArray(tags) ? tags : String(tags).split(','))
                .map((tag) => tag.trim().replace(/^#+/, ''))
                .filter(Boolean);
            if (tagList.length) filter.tags = { $in: tagList.map(exactMatch) };
        }

        if (search) {
            const pattern = new RegExp(escapeRegex(String(search).trim()), 'i');
            filter.$or = [{ title: pattern }, { content: pattern }, { tags: pattern }];
        }

        if (feedType === 'following') {
            if (!req.userId) {
                return res.status(401).json({ error: 'Authentication required for following feed' });
            }
            const currentUser = await userModel.findById(req.userId).select('following');
            if (!currentUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            filter.author = { $in: [...currentUser.following, req.userId] };
        }

        const field = SORTABLE_FIELDS.has(sortBy) ? sortBy : 'createdAt';
        const sort = { [field]: sortOrder === 'asc' ? 1 : -1, _id: -1 };

        const [posts, total] = await Promise.all([
            postModel.find(filter).populate('author', AUTHOR_FIELDS).sort(sort).skip(skip).limit(limit),
            postModel.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            count: posts.length,
            total,
            hasMore: skip + posts.length < total,
            pagination: { limit, skip, page: Math.floor(skip / limit) + 1 },
            posts: await withViewerState(posts, req.userId)
        });
    } catch (error) {
        serverError(res, error);
    }
};

// Get post by id (public)
const renderbyId = async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id).populate('author', AUTHOR_FIELDS);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const [withState] = await withViewerState([post], req.userId);
        res.status(200).json({ success: true, post: withState });
    } catch (error) {
        serverError(res, error);
    }
};

// Update post (protected - only author can update)
const updatePost = async (req, res) => {
    const parsed = updatePostSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: zodMessage(parsed.error) });
    }
    try {
        const post = await postModel.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (post.author.toString() !== req.userId) {
            return res.status(403).json({ error: 'Only the author can edit this post' });
        }

        const { title, content, tags, imageUrl } = parsed.data;
        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;
        if (tags !== undefined || content !== undefined) {
            post.tags = normalizeTags([...extractHashtags(post.content), ...(tags ?? post.tags)]);
        }
        if (imageUrl !== undefined) post.imageUrl = imageUrl;
        post.updatedAt = Date.now();

        await post.save();
        await post.populate('author', AUTHOR_FIELDS);
        const [withState] = await withViewerState([post], req.userId);

        res.status(200).json({ message: 'Post updated successfully', post: withState });
    } catch (error) {
        serverError(res, error);
    }
};

// Delete post (protected - only author can delete)
const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (post.author.toString() !== req.userId) {
            return res.status(403).json({ error: 'Only the author can delete this post' });
        }

        await Promise.all([
            postModel.deleteOne({ _id: postId }),
            commentModel.deleteMany({ post: postId }),
            likeModel.deleteMany({ post: postId })
        ]);

        const mediaKey = extractMediaKey(post.imageUrl);
        if (mediaKey) {
            deleteFromR2(mediaKey).catch((err) => console.error('Media cleanup failed:', err));
        }

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        serverError(res, error);
    }
};

// Add comment (protected)
const addComment = async (req, res) => {
    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: zodMessage(parsed.error) });
    }
    try {
        const postId = req.params.id;
        if (!(await postModel.exists({ _id: postId }))) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = await commentModel.create({
            content: parsed.data.content,
            post: postId,
            user: req.userId
        });
        await comment.populate('user', AUTHOR_FIELDS);
        const commentsCount = await commentModel.countDocuments({ post: postId });

        res.status(201).json({
            message: 'Comment added successfully',
            comment,
            commentsCount
        });
    } catch (error) {
        serverError(res, error);
    }
};

// Get comments for a post (public)
const getComments = async (req, res) => {
    try {
        const postId = req.params.id;
        if (!(await postModel.exists({ _id: postId }))) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comments = await commentModel.find({ post: postId })
            .populate('user', AUTHOR_FIELDS)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: comments.length,
            comments
        });
    } catch (error) {
        serverError(res, error);
    }
};

// Like/unlike are idempotent so a stale client state can't produce an error.
const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        if (!(await postModel.exists({ _id: postId }))) {
            return res.status(404).json({ error: 'Post not found' });
        }
        try {
            await likeModel.create({ post: postId, user: req.userId });
        } catch (error) {
            if (error.code !== 11000) throw error;
        }
        res.status(200).json({ liked: true, likesCount: await syncLikesCount(postId) });
    } catch (error) {
        serverError(res, error);
    }
};

const unlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        if (!(await postModel.exists({ _id: postId }))) {
            return res.status(404).json({ error: 'Post not found' });
        }
        await likeModel.deleteOne({ post: postId, user: req.userId });
        res.status(200).json({ liked: false, likesCount: await syncLikesCount(postId) });
    } catch (error) {
        serverError(res, error);
    }
};

// Get trending hashtags (public)
const getTrendingHashtags = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 25);

        const trending = await postModel.aggregate([
            { $unwind: '$tags' },
            { $group: { _id: { $toLower: '$tags' }, count: { $sum: 1 } } },
            { $match: { _id: { $ne: '' } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: limit },
            { $project: { _id: 0, hashtag: '$_id', count: 1 } }
        ]);

        res.status(200).json({ success: true, trending });
    } catch (error) {
        serverError(res, error);
    }
};

module.exports = {
    createPost,
    renderPost,
    renderbyId,
    updatePost,
    deletePost,
    addComment,
    getComments,
    likePost,
    unlikePost,
    getTrendingHashtags
};
