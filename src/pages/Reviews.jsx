import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBackendContext } from "../contexts/BackendContext";
import { reviewService } from "../services/reviewService";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { currentUser } = useBackendContext();
  
  // New review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [reviewType, setReviewType] = useState('doctor');
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    content: ""
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  // Fetch all public reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await reviewService.getAllReviews(1, 10);
        setReviews(response);
        setHasMore(response.length === 10);
        setLoading(false);
      } catch (err) {
        setError("Failed to load reviews. Please try again later.");
        setLoading(false);
      }
    };

    // Fetch available doctors for the review form
    const fetchDoctors = async () => {
      try {
        // In a real app, replace with actual API call
        const response = [
          { id: 'd1', name: 'Dr. Neha Sharma', specialization: 'Cardiologist' },
          { id: 'd2', name: 'Dr. Shikha Chibber', specialization: 'Neurologist' },
          { id: 'd3', name: 'Dr. Mohan Singh', specialization: 'Pediatrician' }
        ];
        setDoctors(response);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      }
    };

    fetchReviews();
    fetchDoctors();
  }, []);

  // Helper functions

  // Handle new review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError("Please sign in to submit a review.");
      return;
    }
    
    if (reviewType === 'doctor' && !selectedDoctor) {
      setError("Please select a doctor to review.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSubmitStatus({ type: 'loading', message: 'Submitting review...' });
      
      if (reviewType === 'doctor') {
        await reviewService.addDoctorReview(selectedDoctor.id, newReview);
      } else {
        await reviewService.addAppReview(newReview);
      }
      
      // Update the reviews list
      const updatedReviews = await reviewService.getAllReviews(1, 10);
      setReviews(updatedReviews);
      
      // Reset form
      setNewReview({ rating: 5, title: "", content: "" });
      setSelectedDoctor(null);
      setShowReviewForm(false);
      setSubmitStatus({ type: 'success', message: 'Review submitted successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } catch (err) {
      console.error("Review submission error:", err);
      setError(`Failed to submit review: ${err.message}`);
      setSubmitStatus({ 
        type: 'error', 
        message: err.message || "Failed to submit review. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  // Render login status message
  const renderAuthStatus = () => {
    if (currentUser) {
      return (
        <div className="text-end mb-3">
          <span className="badge bg-success">
            <i className="fas fa-user me-1"></i>
            Logged in as {currentUser.name}
          </span>
        </div>
      );
    } else {
      return (
        <div className="alert alert-warning">
          <i className="fas fa-info-circle me-2"></i>
          Please <Link to="/signup" className="alert-link">sign in</Link> to add your own review.
        </div>
      );
    }
  };

  return (
    <div className="container py-5">
      <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark mb-4">
        <div className="row">
          <div className="col-md-8 px-0" style={{ color: "black" }}>
            <h1 className="display-4 font-weight-bold">Reviews & Feedback</h1>
            <p className="lead my-3">
              Read what our users say about doctors and our services.
              Your feedback helps us improve and helps others find the right healthcare provider.
            </p>
          </div>
          <div className="col-md-4 d-flex align-items-center justify-content-md-end">
            {currentUser ? (
              <button 
                onClick={() => setShowReviewForm(true)} 
                className="btn btn-primary btn-lg"
              >
                <i className="fas fa-pen me-2"></i> Write a Review
              </button>
            ) : (
              <Link to="/signup" className="btn btn-outline-primary">
                Sign in to write a review
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Display authentication status */}
      {renderAuthStatus()}

      {/* Status messages */}
      {submitStatus && (
        <div className={`alert ${
          submitStatus.type === 'error' ? 'alert-danger' :
          submitStatus.type === 'success' ? 'alert-success' : 
          'alert-info'
        }`}>
          {submitStatus.type === 'loading' && (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          )}
          {submitStatus.message}
          <button 
            type="button" 
            className="btn-close float-end" 
            onClick={() => setSubmitStatus(null)}
          ></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close float-end" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Rest of the component remains unchanged */}
      {/* ... */}
    </div>
  );
};

export default Reviews;
