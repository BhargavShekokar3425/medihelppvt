const dbService = require('./database.service');

const reviewService = {
  // Create a new review
  createReview: async (reviewData) => {
    try {
      const { patientId, doctorId, rating, text } = reviewData;
      
      // Validate required fields
      if (!patientId || !doctorId || !rating) {
        throw new Error('Missing required review fields');
      }
      
      // Create review
      const review = await dbService.addDocument('reviews', {
        patientId,
        doctorId,
        rating: Number(rating),
        text,
        isVerified: false
      });
      
      // Update doctor's average rating
      await updateDoctorRating(doctorId);
      
      return review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },
  
  // Get reviews for a doctor
  getDoctorReviews: async (doctorId, limit = 20) => {
    try {
      const reviews = await dbService.queryDocuments('reviews', {
        filters: [
          { field: 'doctorId', operator: '==', value: doctorId }
        ],
        orderBy: { field: 'createdAt', direction: 'desc' },
        limit
      });
      
      return reviews;
    } catch (error) {
      console.error('Error getting doctor reviews:', error);
      throw error;
    }
  },
  
  // Update a review
  updateReview: async (reviewId, updateData, userId) => {
    try {
      // Get the review first to validate ownership
      const review = await dbService.getDocument('reviews', reviewId);
      
      if (!review) {
        throw new Error('Review not found');
      }
      
      // Only allow patients to update their own reviews or admins
      if (review.patientId !== userId && updateData.userType !== 'admin') {
        throw new Error('Unauthorized to update this review');
      }
      
      // Update the review
      const updatedReview = await dbService.updateDocument('reviews', reviewId, {
        ...updateData,
        updatedAt: dbService.fieldValues.serverTimestamp()
      });
      
      // If rating was updated, recalculate the doctor's average
      if (updateData.rating) {
        await updateDoctorRating(review.doctorId);
      }
      
      return updatedReview;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },
  
  // Delete a review
  deleteReview: async (reviewId, userId) => {
    try {
      // Get the review first to validate ownership
      const review = await dbService.getDocument('reviews', reviewId);
      
      if (!review) {
        throw new Error('Review not found');
      }
      
      // Only allow patients to delete their own reviews or admins
      if (review.patientId !== userId && userId !== 'admin') {
        throw new Error('Unauthorized to delete this review');
      }
      
      // Delete the review
      await dbService.deleteDocument('reviews', reviewId);
      
      // Recalculate the doctor's average rating
      await updateDoctorRating(review.doctorId);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }
};

// Helper function to update doctor's average rating
const updateDoctorRating = async (doctorId) => {
  try {
    // Get all reviews for this doctor
    const reviews = await dbService.queryDocuments('reviews', {
      filters: [
        { field: 'doctorId', operator: '==', value: doctorId }
      ]
    });
    
    if (!reviews || reviews.length === 0) {
      // No reviews, set rating to 0
      await dbService.updateDocument('users', doctorId, {
        averageRating: 0,
        reviewCount: 0
      });
      return;
    }
    
    // Calculate average rating
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    const average = sum / reviews.length;
    
    // Update doctor document
    await dbService.updateDocument('users', doctorId, {
      averageRating: average,
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error('Error updating doctor rating:', error);
    throw error;
  }
};

module.exports = reviewService;
