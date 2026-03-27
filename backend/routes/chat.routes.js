const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const User = require('../models/User.model');
const { protect } = require('../middleware/auth');

// GET /api/chat/conversations – get all conversations for the current user (with unread counts)
router.get('/conversations', protect, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name role profileImage')
      .populate('lastMessage')
      .sort('-lastMessageAt');

    // For each conversation, count unread messages
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await Message.countDocuments({
          conversation: c._id,
          sender: { $ne: req.user.id }, // Not sent by current user
          readBy: { $nin: [req.user.id] }, // Current user hasn't read it
        });

        const cj = c.toJSON();
        return {
          _id: cj.id || cj._id,
          id: cj.id || cj._id,
          participants: cj.participants.map((p) => ({
            _id: p.id || p._id,
            id: p.id || p._id,
            name: p.name,
            type: p.role,
            avatar: p.profileImage,
          })),
          lastMessage: cj.lastMessage
            ? {
                _id: cj.lastMessage.id || cj.lastMessage._id,
                body: cj.lastMessage.body,
                createdAt: cj.lastMessage.createdAt,
              }
            : null,
          updatedAt: cj.lastMessageAt || cj.updatedAt,
          unreadCount,
        };
      })
    );

    res.json(conversationsWithUnread);
  } catch (err) {
    next(err);
  }
});

// POST /api/chat/conversations – get or create a conversation with a user
router.post('/conversations', protect, async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId] },
    }).populate('participants', 'name role profileImage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, userId],
      });
      conversation = await conversation.populate('participants', 'name role profileImage');
    }

    const cj = conversation.toJSON();
    res.json({
      _id: cj.id || cj._id,
      id: cj.id || cj._id,
      participants: cj.participants.map((p) => ({
        _id: p.id || p._id,
        id: p.id || p._id,
        name: p.name,
        type: p.role,
        avatar: p.profileImage,
      })),
      updatedAt: cj.lastMessageAt || cj.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/conversations/:id/messages – get messages in a conversation (with pagination)
router.get('/conversations/:id/messages', protect, async (req, res, next) => {
  try {
    const { limit = 50, before } = req.query;
    const parsedLimit = Math.min(parseInt(limit) || 50, 100); // Max 100 messages per request

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    // Verify user is a participant
    if (!conversation.participants.some((p) => p.toString() === req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Build query with cursor-based pagination
    let query = { conversation: req.params.id };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Fetch one extra to detect if there are more messages
    const messages = await Message.find(query)
      .populate('sender', 'name role profileImage')
      .sort({ createdAt: -1 }) // Newest first for pagination
      .limit(parsedLimit + 1);

    const hasMore = messages.length > parsedLimit;
    if (hasMore) messages.pop(); // Remove extra message

    // Reverse to get chronological order
    const sortedMessages = messages.reverse();

    res.json({
      messages: sortedMessages.map((m) => {
        const mj = m.toJSON();
        return {
          _id: mj.id || mj._id,
          id: mj.id || mj._id,
          conversationId: req.params.id,
          sender: mj.sender?.id || mj.sender?._id,
          senderName: mj.sender?.name,
          body: mj.body,
          timestamp: mj.createdAt,
          readBy: mj.readBy.map((r) => r.toString()),
          deliveredTo: (mj.deliveredTo || []).map((d) => d.toString()),
        };
      }),
      hasMore,
      oldestTimestamp: sortedMessages[0]?.createdAt || null,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/chat/conversations/:id/messages – send a message
router.post('/conversations/:id/messages', protect, async (req, res, next) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ success: false, message: 'Message body is required' });

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    if (!conversation.participants.some((p) => p.toString() === req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user.id,
      body,
      readBy: [req.user.id],
      deliveredTo: [], // Will be updated when recipient receives via socket
    });

    // Update conversation's lastMessage
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    // Emit socket event if io is attached to the app (done in server.js)
    const io = req.app.get('io');
    if (io) {
      const recipientIds = conversation.participants
        .filter((p) => p.toString() !== req.user.id)
        .map((p) => p.toString());

      // Emit to each recipient's private room
      recipientIds.forEach((recipientId) => {
        io.to(`user:${recipientId}`).emit('message:new', {
          _id: message._id,
          id: message._id,
          conversationId: req.params.id,
          sender: req.user.id,
          senderName: req.user.name,
          body: message.body,
          timestamp: message.createdAt,
          readBy: message.readBy.map((r) => r.toString()),
          deliveredTo: [],
        });
      });
    }

    res.status(201).json({
      _id: message._id,
      id: message._id,
      conversationId: req.params.id,
      sender: req.user.id,
      senderName: req.user.name,
      body: message.body,
      timestamp: message.createdAt,
      readBy: message.readBy.map((r) => r.toString()),
      deliveredTo: [],
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/users/:type – get users by role (for contacts list)
router.get('/users/:type', protect, async (req, res, next) => {
  try {
    const type = req.params.type.toLowerCase();
    const users = await User.find({ role: type }).select('name role profileImage');
    res.json(
      users.map((u) => ({
        _id: u.id || u._id,
        id: u.id || u._id,
        name: u.name,
        type: u.role,
        avatar: u.profileImage,
        status: 'offline', // Real status will be managed via Socket.io
        lastSeen: null,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// PUT /api/chat/messages/:id/read – mark a message as read
router.put('/messages/:id/read', protect, async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    if (!message.readBy.some((r) => r.toString() === req.user.id)) {
      message.readBy.push(req.user.id);
      await message.save();
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// PUT /api/chat/conversations/:id/delivered – mark all messages in conversation as delivered
router.put('/conversations/:id/delivered', protect, async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    // Verify participant
    if (!conversation.participants.some((p) => p.toString() === req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update all messages not sent by current user to include current user in deliveredTo
    const result = await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user.id },
        deliveredTo: { $nin: [req.user.id] },
      },
      { $addToSet: { deliveredTo: req.user.id } }
    );

    // Emit socket event to notify senders
    const io = req.app.get('io');
    if (io && result.modifiedCount > 0) {
      const senderIds = conversation.participants
        .filter((p) => p.toString() !== req.user.id)
        .map((p) => p.toString());

      senderIds.forEach((senderId) => {
        io.to(`user:${senderId}`).emit('messages:delivered', {
          conversationId: req.params.id,
          deliveredTo: req.user.id,
        });
      });
    }

    res.json({ success: true, updatedCount: result.modifiedCount });
  } catch (err) {
    next(err);
  }
});

// PUT /api/chat/conversations/:id/read – mark all messages in conversation as read
router.put('/conversations/:id/read', protect, async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    if (!conversation.participants.some((p) => p.toString() === req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const result = await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user.id },
        readBy: { $nin: [req.user.id] },
      },
      { $addToSet: { readBy: req.user.id } }
    );

    // Emit socket event for read receipts
    const io = req.app.get('io');
    if (io && result.modifiedCount > 0) {
      const senderIds = conversation.participants
        .filter((p) => p.toString() !== req.user.id)
        .map((p) => p.toString());

      senderIds.forEach((senderId) => {
        io.to(`user:${senderId}`).emit('messages:read', {
          conversationId: req.params.id,
          readBy: req.user.id,
        });
      });
    }

    res.json({ success: true, updatedCount: result.modifiedCount });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
