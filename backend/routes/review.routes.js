const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Sample reviews data if not already in dataStore
if (!global.dataStore.reviews) {
  global.dataStore.reviews = {};
}

// Example review controller functions
const reviewController = {
  addReview: (req, res) => {
    const userId = req.user.id;
    const { doctorId, rating, title, content } = req.body;
    
    if (!doctorId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Doctor ID and rating are required'
      });
    }
    
    const reviewId = uuidv4();
    const newReview = {
      id: reviewId,
      doctorId,
      authorId: userId,
      rating,
      title: title || '',
      content: content || '',
      createdAt: new Date().toISOString(),
      isPublic: true
    };
    
    // Save to dataStore
    global.dataStore.reviews[reviewId] = newReview;
    
    res.status(201).json({
      success: true,
      data: newReview
    });
  },
  
  getDoctorReviews: (req, res) => {
    const { doctorId } = req.params;
    
    // Filter reviews for this doctor
    const doctorReviews = Object.values(global.dataStore.reviews)
      .filter(review => review.doctorId === doctorId && review.isPublic === true);
    
    res.json({
      success: true,
      data: doctorReviews
    });
  },
  
  getAppReviews: (req, res) => {
    // Filter app reviews
    const appReviews = Object.values(global.dataStore.reviews)
      .filter(review => review.reviewType === 'app' && review.isPublic === true);
    
    res.json({
      success: true,
      data: appReviews
    });
  }
};

// Public review routes
router.get('/doctor/:doctorId', reviewController.getDoctorReviews);
router.get('/app', reviewController.getAppReviews);

// Protected review routes
router.use(protect);
router.post('/', reviewController.addReview);

module.exports = router;
