const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// Get all conversations for a user
exports.getConversations = asyncHandler(async (req, res, next) => {
  const conversations = await Conversation.find({
    participants: { $in: [req.user.id] },
    isActive: true
  })
    .populate({
      path: 'participants',
      select: 'name avatar role lastSeen',
      match: { _id: { $ne: req.user.id } }
    })
    .populate({
      path: 'lastMessage',
      select: 'text sender createdAt readBy'
    })
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations
  });
});

// Get single conversation
exports.getConversation = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate({
      path: 'participants',
      select: 'name avatar role lastSeen'
    });
    
  if (!conversation) {
    return next(new ErrorResponse(`Conversation not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user is a participant
  if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
    return next(new ErrorResponse(`Not authorized to access this conversation`, 403));
  }
  
  res.status(200).json({
    success: true,
    data: conversation
  });
});

// Create new conversation
exports.createConversation = asyncHandler(async (req, res, next) => {
  const { participantId } = req.body;
  
  if (!participantId) {
    return next(new ErrorResponse('Please provide a participant ID', 400));
  }
  
  // Check if participant exists
  const participant = await User.findById(participantId);
  if (!participant) {
    return next(new ErrorResponse('Participant not found', 404));
  }
  
  // Check if conversation already exists
  const existingConversation = await Conversation.findOne({
    participants: { $all: [req.user.id, participantId] },
    type: 'individual'
  });
  
  if (existingConversation) {
    return res.status(200).json({
      success: true,
      data: existingConversation
    });
  }
  
  // Create new conversation
  const conversation = await Conversation.create({
    participants: [req.user.id, participantId],
    type: 'individual',
    createdBy: req.user.id
  });
  
  const populatedConversation = await Conversation.findById(conversation._id)
    .populate({
      path: 'participants',
      select: 'name avatar role lastSeen'
    });
  
  res.status(201).json({
    success: true,
    data: populatedConversation
  });
});

// Get messages for a conversation
exports.getMessages = asyncHandler(async (req, res, next) => {
  const conversationId = req.params.conversationId;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const startIndex = (page - 1) * limit;
  
  // Check if conversation exists and user is participant
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    return next(new ErrorResponse(`Conversation not found with id of ${conversationId}`, 404));
  }
  
  // Check if user is participant
  if (!conversation.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`Not authorized to access this conversation`, 403));
  }
  
  const messages = await Message.find({ 
    conversation: conversationId,
    isDeleted: false 
  })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate({
      path: 'sender',
      select: 'name avatar role'
    });
    
  // Update messages as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user.id },
      'readBy.user': { $ne: req.user.id }
    },
    {
      $push: { readBy: { user: req.user.id, readAt: Date.now() } }
    }
  );
  
  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages.reverse()
  });
});

// Send message
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { text, attachments } = req.body;
  const conversationId = req.params.conversationId;
  
  if (!text && (!attachments || attachments.length === 0)) {
    return next(new ErrorResponse('Please provide message text or attachments', 400));
  }
  
  // Check if conversation exists and user is participant
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    return next(new ErrorResponse(`Conversation not found with id of ${conversationId}`, 404));
  }
  
  // Check if user is participant
  if (!conversation.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`Not authorized to access this conversation`, 403));
  }
  
  // Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: req.user.id,
    text,
    attachments: attachments || [],
    readBy: [{ user: req.user.id }]
  });
  
  // Update conversation lastMessage
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    updatedAt: Date.now()
  });
  
  const populatedMessage = await Message.findById(message._id)
    .populate({
      path: 'sender',
      select: 'name avatar role'
    });
  
  // Emit socket event
  const io = req.app.get('io');
  conversation.participants.forEach(participant => {
    if (participant.toString() !== req.user.id) {
      io.to(participant.toString()).emit('message:new', populatedMessage);
    }
  });
  
  res.status(201).json({
    success: true,
    data: populatedMessage
  });
});

// Mark message as read
exports.markMessageAsRead = asyncHandler(async (req, res, next) => {
  const messageId = req.params.id;
  
  const message = await Message.findById(messageId);
  
  if (!message) {
    return next(new ErrorResponse(`Message not found with id of ${messageId}`, 404));
  }
  
  // Check if user is participant in conversation
  const conversation = await Conversation.findById(message.conversation);
  
  if (!conversation.participants.includes(req.user.id)) {
    return next(new ErrorResponse('Not authorized to access this message', 403));
  }
  
  // Check if message is already read by user
  if (message.readBy.some(read => read.user.toString() === req.user.id)) {
    return res.status(200).json({
      success: true,
      data: message
    });
  }
  
  // Mark message as read
  message.readBy.push({ user: req.user.id, readAt: Date.now() });
  await message.save();
  
  // Emit socket event
  const io = req.app.get('io');
  conversation.participants.forEach(participant => {
    if (participant.toString() !== req.user.id) {
      io.to(participant.toString()).emit('message:read', {
        messageId: message._id,
        readBy: message.readBy
      });
    }
  });
  
  res.status(200).json({
    success: true,
    data: message
  });
});
