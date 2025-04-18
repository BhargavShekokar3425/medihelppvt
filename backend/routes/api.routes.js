const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Import controllers
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const chatController = require('../controllers/chat.controller');
const prescriptionController = require('../controllers/prescription.controller');
const appointmentController = require('../controllers/appointment.controller');
const reviewController = require('../controllers/review.controller');
const forumController = require('../controllers/forum.controller');
const emergencyController = require('../controllers/emergency.controller');
const monitoringController = require('../controllers/monitoring.controller');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authMiddleware, authController.logout);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/verify-email', authMiddleware, authController.verifyEmail);

// User routes
router.get('/users/me', authMiddleware, userController.getCurrentUser);
router.get('/users/:id', authMiddleware, userController.getUserById);
router.get('/users', authMiddleware, userController.getUsers);
router.put('/users/me', authMiddleware, userController.updateCurrentUser);
router.post('/users/avatar', authMiddleware, userController.uploadAvatar);

// Doctors
router.get('/doctors', userController.getDoctors);
router.get('/doctors/top-rated', userController.getTopRatedDoctors);
router.get('/doctors/:id', userController.getDoctorById);

// Chat routes
router.get('/chat/conversations', authMiddleware, chatController.getConversations);
router.post('/chat/conversations', authMiddleware, chatController.createConversation);
router.get('/chat/conversations/:id', authMiddleware, chatController.getConversation);
router.get('/chat/conversations/:id/messages', authMiddleware, chatController.getMessages);
router.post('/chat/conversations/:id/messages', authMiddleware, chatController.sendMessage);
router.put('/chat/messages/:id/read', authMiddleware, chatController.markMessageAsRead);

// Prescription routes
router.get('/prescriptions', authMiddleware, prescriptionController.getPrescriptions);
router.post('/prescriptions', authMiddleware, prescriptionController.createPrescription);
router.get('/prescriptions/:id', authMiddleware, prescriptionController.getPrescription);
router.put('/prescriptions/:id/status', authMiddleware, prescriptionController.updatePrescriptionStatus);
router.post('/prescriptions/upload', authMiddleware, prescriptionController.uploadPrescriptionImage);

// Appointment routes
router.get('/appointments', authMiddleware, appointmentController.getAppointments);
router.post('/appointments', authMiddleware, appointmentController.createAppointment);
router.get('/appointments/:id', authMiddleware, appointmentController.getAppointment);
router.put('/appointments/:id/status', authMiddleware, appointmentController.updateAppointmentStatus);

// Review routes
router.get('/reviews/doctor/:doctorId', reviewController.getDoctorReviews);
router.post('/reviews', authMiddleware, reviewController.createReview);
router.put('/reviews/:id', authMiddleware, reviewController.updateReview);
router.delete('/reviews/:id', authMiddleware, reviewController.deleteReview);

// Forum routes
router.get('/forum/posts', forumController.getPosts);
router.post('/forum/posts', authMiddleware, forumController.createPost);
router.get('/forum/posts/:id', forumController.getPost);
router.post('/forum/posts/:id/answers', authMiddleware, forumController.createAnswer);
router.post('/forum/posts/:id/vote', authMiddleware, forumController.votePost);

// Emergency routes
router.post('/emergency/sos', authMiddleware, emergencyController.createEmergencyRequest);
router.get('/emergency/:id', authMiddleware, emergencyController.getEmergencyRequest);
router.put('/emergency/:id/status', authMiddleware, emergencyController.updateEmergencyRequestStatus);

// System monitoring routes
router.get('/health', monitoringController.getHealthStatus);
router.post('/health/repair', authMiddleware, roleMiddleware(['admin']), monitoringController.repairDatabase);
router.get('/metrics', authMiddleware, roleMiddleware(['admin']), monitoringController.getSystemMetrics);

module.exports = router;
