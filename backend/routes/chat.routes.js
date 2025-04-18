const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Chat routes
router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.createConversation);
router.get('/conversations/:id', chatController.getConversation);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', chatController.sendMessage);
router.put('/conversations/:conversationId/read', chatController.markConversationRead);

module.exports = router;
