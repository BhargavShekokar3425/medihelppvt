const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPost.model');
const { protect } = require('../middleware/auth');

// Helper: populate author fields on a post (and nested answers/comments)
const populatePost = (query) =>
  query
    .populate('author', 'name role profileImage')
    .populate('answers.author', 'name role profileImage')
    .populate('comments.author', 'name role profileImage');

// Map a DB doc to the shape the frontend expects
const mapPost = (post, userId) => {
  const p = post.toJSON ? post.toJSON() : post;
  const authorName = p.author?.name || 'Anonymous';
  const authorRole = p.author?.role
    ? p.author.role.charAt(0).toUpperCase() + p.author.role.slice(1)
    : '';

  return {
    id: p.id || p._id,
    title: p.title,
    body: p.body,
    tags: p.tags || [],
    author: `${authorName} (${authorRole})`,
    authorId: p.author?.id || p.author?._id,
    upvotes: p.upvoteCount ?? (p.upvotes ? p.upvotes.length : 0),
    downvotes: p.downvoteCount ?? (p.downvotes ? p.downvotes.length : 0),
    userUpvoted: userId ? (p.upvotes || []).some((u) => u.toString() === userId || u._id?.toString() === userId) : false,
    userDownvoted: userId ? (p.downvotes || []).some((u) => u.toString() === userId || u._id?.toString() === userId) : false,
    answers: (p.answers || []).map((a) => ({
      id: a.id || a._id,
      body: a.body,
      author: a.author?.name
        ? `${a.author.name} (${(a.author.role || '').charAt(0).toUpperCase() + (a.author.role || '').slice(1)})`
        : 'Anonymous',
      badge: a.badge,
      createdAt: a.createdAt,
    })),
    comments: (p.comments || []).map((c) => ({
      id: c.id || c._id,
      body: c.body,
      author: c.author?.name || 'Anonymous',
      createdAt: c.createdAt,
    })),
    createdAt: p.createdAt,
  };
};

// GET /api/forum — list all posts (newest first), optionally ?search=
router.get('/', async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { title: regex },
        { body: regex },
        { tags: regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      populatePost(ForumPost.find(filter).sort('-createdAt').skip(skip).limit(Number(limit))),
      ForumPost.countDocuments(filter),
    ]);

    // Try to get userId from token (optional – don't require auth for reading)
    let userId = null;
    try {
      const jwt = require('jsonwebtoken');
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      }
    } catch (_) {
      /* not logged in – fine */
    }

    res.json({
      posts: posts.map((p) => mapPost(p, userId)),
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/forum/:id — single post
router.get('/:id', async (req, res, next) => {
  try {
    const post = await populatePost(ForumPost.findById(req.params.id));
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    let userId = null;
    try {
      const jwt = require('jsonwebtoken');
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      }
    } catch (_) {}

    res.json(mapPost(post, userId));
  } catch (err) {
    next(err);
  }
});

// POST /api/forum — create post (auth required)
router.post('/', protect, async (req, res, next) => {
  try {
    const { title, body, tags } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required.' });
    }

    const post = await ForumPost.create({
      title,
      body,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [],
      author: req.user.id,
    });

    const populated = await populatePost(ForumPost.findById(post._id));
    res.status(201).json(mapPost(populated, req.user.id));
  } catch (err) {
    next(err);
  }
});

// POST /api/forum/:id/upvote — toggle upvote (auth required)
router.post('/:id/upvote', protect, async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user.id;
    const upIdx = post.upvotes.findIndex((u) => u.toString() === userId);
    const downIdx = post.downvotes.findIndex((u) => u.toString() === userId);

    if (upIdx !== -1) {
      post.upvotes.splice(upIdx, 1); // un-upvote
    } else {
      post.upvotes.push(userId);
      if (downIdx !== -1) post.downvotes.splice(downIdx, 1); // remove downvote
    }

    await post.save();
    const populated = await populatePost(ForumPost.findById(post._id));
    res.json(mapPost(populated, userId));
  } catch (err) {
    next(err);
  }
});

// POST /api/forum/:id/downvote — toggle downvote (auth required)
router.post('/:id/downvote', protect, async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user.id;
    const downIdx = post.downvotes.findIndex((u) => u.toString() === userId);
    const upIdx = post.upvotes.findIndex((u) => u.toString() === userId);

    if (downIdx !== -1) {
      post.downvotes.splice(downIdx, 1);
    } else {
      post.downvotes.push(userId);
      if (upIdx !== -1) post.upvotes.splice(upIdx, 1);
    }

    await post.save();
    const populated = await populatePost(ForumPost.findById(post._id));
    res.json(mapPost(populated, userId));
  } catch (err) {
    next(err);
  }
});

// POST /api/forum/:id/answers — add answer (auth required)
router.post('/:id/answers', protect, async (req, res, next) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ success: false, message: 'Answer body is required.' });

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const roleCap = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);
    const badge =
      req.user.role === 'doctor'
        ? 'Doctor Verified Answer'
        : req.user.role === 'pharmacist'
        ? 'Pharmacist Verified Answer'
        : null;

    post.answers.push({
      body,
      author: req.user.id,
      badge,
    });

    await post.save();
    const populated = await populatePost(ForumPost.findById(post._id));
    res.status(201).json(mapPost(populated, req.user.id));
  } catch (err) {
    next(err);
  }
});

// POST /api/forum/:id/comments — add comment (auth required)
router.post('/:id/comments', protect, async (req, res, next) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ success: false, message: 'Comment body is required.' });

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({
      body,
      author: req.user.id,
    });

    await post.save();
    const populated = await populatePost(ForumPost.findById(post._id));
    res.status(201).json(mapPost(populated, req.user.id));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/forum/:id — delete post (auth, owner only)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post.' });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
