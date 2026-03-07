const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// In-memory notification store (can be upgraded to a MongoDB model later)
const notifications = [];

// GET /api/notifications — get user notifications
router.get('/', protect, async (req, res) => {
  const userNotifs = notifications.filter(
    (n) => n.userId === req.user._id.toString()
  );
  res.json(userNotifs);
});

// POST /api/notifications — create notification (internal use)
router.post('/', protect, async (req, res) => {
  const notif = {
    id: `notif_${Date.now()}`,
    userId: req.body.userId || req.user._id.toString(),
    type: req.body.type || 'info',
    message: req.body.message || '',
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.push(notif);
  res.status(201).json(notif);
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  const notif = notifications.find((n) => n.id === req.params.id);
  if (!notif) return res.status(404).json({ message: 'Notification not found' });
  notif.read = true;
  res.json(notif);
});

module.exports = router;
