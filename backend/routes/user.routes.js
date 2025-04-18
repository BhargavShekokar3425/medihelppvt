const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// These routes will be prefixed with /api/users
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);

module.exports = router;
