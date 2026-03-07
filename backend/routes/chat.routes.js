const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const User = require('../models/User.model');
const { protect } = require('../middleware/auth');

// GET /api/chat/conversations – get all conversations for the current user
router.get('/conversations', protect, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name role profileImage')
      .populate('lastMessage')
      .sort('-lastMessageAt');

    res.json(
      conversations.map((c) => {
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
        };
      })
    );
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

// GET /api/chat/conversations/:id/messages – get messages in a conversation
router.get('/conversations/:id/messages', protect, async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    // Verify user is a participant
    if (!conversation.participants.some((p) => p.toString() === req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name role profileImage')
      .sort('createdAt');

    res.json(
      messages.map((m) => {
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
        };
      })
    );
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

module.exports = router;
