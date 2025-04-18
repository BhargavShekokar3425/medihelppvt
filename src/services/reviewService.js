import apiService from './apiService';

export const reviewService = {
  // Add a new review - can be for doctor or app
  addReview: async (reviewData) => {
    try {
      const response = await apiService.post('/reviews', reviewData);
      
      console.log(`Review added successfully for ${reviewData.reviewType}`);
      return response;
    } catch (error) {
      console.error("Add review error:", error);
      throw error;
    }
  },
  
  // Add a doctor review
  addDoctorReview: async (doctorId, reviewData) => {
    try {
      console.log("Adding doctor review:", { doctorId, ...reviewData });
      const response = await apiService.post('/reviews', {
        doctorId,
        reviewType: 'doctor',
        ...reviewData
      });
      
      console.log("Review added successfully for doctor:", doctorId);
      return response;
    } catch (error) {
      console.error("Add doctor review error:", error);
      
      // Enhanced error message for debugging
      let errorMessage = "Failed to add review";
      if (error.response) {
        errorMessage = `Server error: ${error.response.data?.message || error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error: The server did not respond";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      throw new Error(errorMessage);
    }
  },
  
  // Add an app review
  addAppReview: async (reviewData) => {
    try {
      console.log("Adding app review:", reviewData);
      const response = await apiService.post('/reviews', {
        reviewType: 'app',
        ...reviewData
      });
      
      console.log("App review added successfully");
      return response;
    } catch (error) {
      console.error("Add app review error:", error);
      
      // Enhanced error message for debugging
      let errorMessage = "Failed to add review";
      if (error.response) {
        errorMessage = `Server error: ${error.response.data?.message || error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error: The server did not respond";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      throw new Error(errorMessage);
    }
  },
  
  // Get reviews for a doctor
  getDoctorReviews: async (doctorId) => {
    try {
      const response = await apiService.get(`/reviews/doctor/${doctorId}`);
      return response;
    } catch (error) {
      console.error("Get doctor reviews error:", error);
      throw error;
    }
  },
  
  // Get app reviews
  getAppReviews: async () => {
    try {
      const response = await apiService.get('/reviews/app');
      return response;
    } catch (error) {
      console.error("Get app reviews error:", error);
      throw error;
    }
  },
  
  // Get top rated doctors
  getTopRatedDoctors: async (limit = 5) => {
    try {
      const response = await apiService.get('/reviews/top-rated', { params: { limit } });
      return response;
    } catch (error) {
      console.error("Get top rated doctors error:", error);
      throw error;
    }
  },
  
  // Get all public reviews (paginated)
  getAllReviews: async (page = 1, limit = 10) => {
    try {
      const response = await apiService.get('/reviews', { 
        params: { page, limit } 
      });
      return response;
    } catch (error) {
      console.error("Get all reviews error:", error);
      throw error;
    }
  },
  
  // Update a review - can only be done by the author
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await apiService.put(`/reviews/${reviewId}`, reviewData);
      return response;
    } catch (error) {
      console.error("Update review error:", error);
      throw error;
    }
  },
  
  // Delete a review - can only be done by the author
  deleteReview: async (reviewId) => {
    try {
      const response = await apiService.delete(`/reviews/${reviewId}`);
      return response;
    } catch (error) {
      console.error("Delete review error:", error);
      throw error;
    }
  }
};

export default reviewService;
