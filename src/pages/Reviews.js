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
        const response = await fetchAvailableDoctors();
        setDoctors(response);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      }
    };

    fetchReviews();
    fetchDoctors();
  }, []);

  // Mock function to fetch doctors - replace with actual API call
  const fetchAvailableDoctors = async () => {
    // In a real app, this would come from an API
    return [
      { id: 'd1', name: 'Dr. Neha Sharma', specialization: 'Cardiologist' },
      { id: 'd2', name: 'Dr. Shikha Chibber', specialization: 'Neurologist' },
      { id: 'd3', name: 'Dr. Mohan Singh', specialization: 'Pediatrician' }
    ];
  };

  // Load more reviews when scrolling
  const loadMoreReviews = async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      const nextPage = page + 1;
      const moreReviews = await reviewService.getAllReviews(nextPage, 10);
      
      if (moreReviews.length === 0) {
        setHasMore(false);
      } else {
        setReviews([...reviews, ...moreReviews]);
        setPage(nextPage);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to load more reviews.");
      setLoading(false);
    }
  };

  // Handle new review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (reviewType === 'doctor' && !selectedDoctor) {
      setError("Please select a doctor to review.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare review object with all required attributes
      const reviewPayload = {
        ...newReview,
        reviewType,
        createdAt: new Date().toISOString(),
        author: {
          id: currentUser?.id || currentUser?._id || "",
          name: currentUser?.name || "",
          avatar: currentUser?.avatar || ""
        }
      };
      if (reviewType === 'doctor') {
        reviewPayload.doctor = {
          id: selectedDoctor.id,
          name: selectedDoctor.name,
          specialization: selectedDoctor.specialization,
          avatar: selectedDoctor.avatar || ""
        };
        await reviewService.addDoctorReview(selectedDoctor.id, reviewPayload);
      } else {
        await reviewService.addAppReview(reviewPayload);
      }

      // Update the reviews list
      const updatedReviews = await reviewService.getAllReviews(1, 10);
      setReviews(updatedReviews);

      // Reset form
      setNewReview({ rating: 5, title: "", content: "" });
      setSelectedDoctor(null);
      setShowReviewForm(false);
    } catch (err) {
      console.error("Review submission error:", err);
      setError(`Failed to submit review: ${err.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < rating ? "text-warning" : "text-muted"}>
        ★
      </span>
    ));
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
            {currentUser && (
              <button 
                onClick={() => setShowReviewForm(true)} 
                className="btn btn-primary btn-lg"
              >
                <i className="fas fa-pen me-2"></i> Write a Review
              </button>
            )}
          </div>
        </div>
      </div>

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

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Write a Review</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowReviewForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3">
                    <label className="form-label">What are you reviewing?</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="reviewType"
                        id="reviewTypeDoctor"
                        value="doctor"
                        checked={reviewType === 'doctor'}
                        onChange={() => setReviewType('doctor')}
                      />
                      <label className="form-check-label" htmlFor="reviewTypeDoctor">
                        A Doctor
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="reviewType"
                        id="reviewTypeApp"
                        value="app"
                        checked={reviewType === 'app'}
                        onChange={() => setReviewType('app')}
                      />
                      <label className="form-check-label" htmlFor="reviewTypeApp">
                        MediHelp App
                      </label>
                    </div>
                  </div>
                  
                  {reviewType === 'doctor' && (
                    <div className="mb-3">
                      <label className="form-label">Select Doctor</label>
                      <select 
                        className="form-select"
                        value={selectedDoctor?.id || ''}
                        onChange={(e) => {
                          const doctor = doctors.find(d => d.id === e.target.value);
                          setSelectedDoctor(doctor);
                        }}
                        required={reviewType === 'doctor'}
                      >
                        <option value="">Choose a doctor...</option>
                        {doctors.map(doctor => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialization}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label className="form-label">Rating</label>
                    <div>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span 
                          key={star} 
                          onClick={() => setNewReview({...newReview, rating: star})}
                          className={`star-rating ${newReview.rating >= star ? 'active' : ''}`}
                          style={{
                            cursor: 'pointer', 
                            fontSize: '2rem', 
                            color: newReview.rating >= star ? '#FFD700' : '#ccc',
                            marginRight: '5px'
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Review Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newReview.title}
                      onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Your Review</label>
                    <textarea 
                      className="form-control" 
                      rows="5"
                      value={newReview.content}
                      onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="d-flex justify-content-end">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary me-2"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : null}
                      Submit Review
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="row">
        <div className="col-lg-8">
          <h2 className="mb-4">Latest Reviews</h2>
          
          {loading && reviews.length === 0 ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="alert alert-info">
              No reviews yet. Be the first to share your experience!
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="card mb-4 shadow-sm">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">{review.title}</h5>
                      <div>{renderStars(review.rating)}</div>
                    </div>
                    <div>
                      <span className="badge bg-secondary me-2">
                        {review.reviewType === 'doctor' ? 'Doctor Review' : 'App Review'}
                      </span>
                      <small className="text-muted">
                        {formatDate(review.createdAt)}
                      </small>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="card-text">{review.content}</p>
                    
                    {review.reviewType === 'doctor' && review.doctor && (
                      <div className="doctor-info d-flex align-items-center mt-3">
                        <img 
                          src={review.doctor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.doctor?.name || 'Doctor')}`} 
                          alt={review.doctor?.name} 
                          className="rounded-circle me-2"
                          width="40"
                          height="40"
                        />
                        <div>
                          <p className="mb-0">
                            <strong>Doctor: </strong>
                            <Link to={`/doctors/${review.doctor?.id}`} className="text-decoration-none">
                              {review.doctor?.name}
                            </Link>
                          </p>
                          <small className="text-muted">
                            {review.doctor?.specialization}
                          </small>
                        </div>
                      </div>
                    )}
                    
                    <hr />
                    
                    <div className="patient-info d-flex align-items-center">
                      <img 
                        src={review.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author?.name || 'User')}`} 
                        alt={review.author?.name} 
                        className="rounded-circle me-2"
                        width="30"
                        height="30"
                      />
                      <div>
                        <small className="text-muted">
                          Review by 
                          <strong> {review.author?.name}</strong>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div className="text-center my-4">
                  <button 
                    className="btn btn-outline-primary" 
                    onClick={loadMoreReviews}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : null}
                    Load More Reviews
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Top Rated Doctors</h5>
            </div>
            <div className="list-group list-group-flush">
              {doctors.slice(0, 5).map((doctor) => (
                <Link 
                  key={doctor.id} 
                  to={`/doctors/${doctor.id}`} 
                  className="list-group-item list-group-item-action d-flex align-items-center"
                >
                  <img 
                    src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}`} 
                    alt={doctor.name} 
                    className="rounded-circle me-3"
                    width="50"
                    height="50"
                  />
                  <div>
                    <h6 className="mb-0">{doctor.name}</h6>
                    <small className="text-muted">
                      {doctor.specialization}
                    </small>
                  </div>
                </Link>
              ))}
            </div>
            <div className="card-footer">
              <Link to="/doctors" className="btn btn-outline-primary w-100">
                View All Doctors
              </Link>
            </div>
          </div>
          
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Need Medical Help?</h5>
            </div>
            <div className="card-body">
              <p>
                Connect with our medical professionals or book an appointment now.
              </p>
              <div className="d-grid gap-2">
                <Link to="/docanswers" className="btn btn-outline-info">
                  <i className="fas fa-comment-medical me-1"></i> Chat with Doctor
                </Link>
                <Link to="/appointments" className="btn btn-outline-info">
                  <i className="fas fa-calendar-check me-1"></i> Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
