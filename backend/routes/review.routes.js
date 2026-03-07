const express = require('express');
const router = express.Router();
const Review = require('../models/Review.model');
const { protect } = require('../middleware/auth');

const populateReview = (query) =>
  query
    .populate('patient', 'name profileImage')
    .populate('doctor', 'name specialization profileImage');

// GET /api/reviews — paginated, optional ?doctorId= or ?reviewType= filters
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.doctorId) filter.doctor = req.query.doctorId;
    if (req.query.reviewType) filter.reviewType = req.query.reviewType;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const reviews = await populateReview(
      Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
    );

    // Map to shape expected by frontend
    const mapped = reviews.map(mapReviewForFrontend);
    res.json(mapped);
  } catch (err) {
    next(err);
  }
});

// GET /api/reviews/doctor/:doctorId
router.get('/doctor/:doctorId', async (req, res, next) => {
  try {
    const reviews = await populateReview(
      Review.find({ doctor: req.params.doctorId }).sort({ createdAt: -1 })
    );
    res.json(reviews.map(mapReviewForFrontend));
  } catch (err) {
    next(err);
  }
});

// GET /api/reviews/app — app-level reviews only
router.get('/app', async (req, res, next) => {
  try {
    const reviews = await populateReview(
      Review.find({ reviewType: 'app' }).sort({ createdAt: -1 })
    );
    res.json(reviews.map(mapReviewForFrontend));
  } catch (err) {
    next(err);
  }
});

// GET /api/reviews/top-rated — doctors with best average rating
router.get('/top-rated', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const topDoctors = await Review.aggregate([
      { $match: { reviewType: 'doctor', doctor: { $ne: null } } },
      { $group: { _id: '$doctor', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      { $sort: { avgRating: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      {
        $project: {
          _id: 0,
          id: '$doctor._id',
          name: '$doctor.name',
          specialization: '$doctor.specialization',
          profileImage: '$doctor.profileImage',
          avgRating: 1,
          reviewCount: '$count',
        },
      },
    ]);
    res.json(topDoctors);
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews
router.post('/', protect, async (req, res, next) => {
  try {
    const { doctorId, rating, title, content, reviewType } = req.body;

    if (!rating) {
      return res.status(400).json({ success: false, message: 'Rating is required.' });
    }

    const type = reviewType || 'doctor';
    if (type === 'doctor' && !doctorId) {
      return res.status(400).json({ success: false, message: 'doctorId is required for doctor reviews.' });
    }

    const review = await Review.create({
      patient: req.user._id,
      doctor: type === 'doctor' ? doctorId : undefined,
      rating,
      title: title || '',
      content: content || '',
      reviewType: type,
    });

    const populated = await populateReview(Review.findById(review._id));
    res.status(201).json(mapReviewForFrontend(populated));
  } catch (err) {
    next(err);
  }
});

// PUT /api/reviews/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (!req.user._id.equals(review.patient) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised.' });
    }

    const { rating, title, content } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (content !== undefined) review.content = content;
    await review.save();

    const populated = await populateReview(Review.findById(review._id));
    res.json(mapReviewForFrontend(populated));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (!req.user._id.equals(review.patient) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised.' });
    }
    await review.deleteOne();
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
});

// Helper: Map review doc → frontend-expected shape
function mapReviewForFrontend(review) {
  const r = review.toJSON ? review.toJSON() : review;
  return {
    ...r,
    // Frontend expects author object
    author: r.patient
      ? { id: r.patient._id || r.patient.id, name: r.patient.name, avatar: r.patient.profileImage }
      : { id: '', name: 'Anonymous', avatar: '' },
    // Frontend expects doctor object with specific fields
    doctor: r.doctor
      ? { id: r.doctor._id || r.doctor.id, name: r.doctor.name, specialization: r.doctor.specialization, avatar: r.doctor.profileImage }
      : null,
  };
}

module.exports = router;
