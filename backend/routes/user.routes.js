const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const { protect, authorize } = require('../middleware/auth');

// GET /api/users/profile — get current user
router.get('/profile', protect, async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/profile OR /api/users/profile/:id — update current user
router.put('/profile/:id?', protect, async (req, res, next) => {
  try {
    // Prevent changing password / role via this endpoint
    const { password, role, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/doctors — public list of doctors with filtering
router.get('/doctors', async (req, res, next) => {
  try {
    const { 
      specialization, 
      city, 
      state,
      minRating,
      maxFee,
      search,
      lat, 
      lng, 
      radius = 50, // km
      sortBy = 'rating',
      page = 1,
      limit = 20
    } = req.query;

    const filter = { role: 'doctor', isActive: { $ne: false } };

    // Text search on name/specialization
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by specialization
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }

    // Filter by city
    if (city) {
      filter.$or = [
        { 'location.city': { $regex: city, $options: 'i' } },
        { 'clinic.address': { $regex: city, $options: 'i' } }
      ];
    }

    // Filter by state
    if (state) {
      filter['location.state'] = { $regex: state, $options: 'i' };
    }

    // Filter by minimum rating
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    // Filter by max consultation fee
    if (maxFee) {
      filter.consultationFee = { $lte: parseFloat(maxFee) };
    }

    // Geo-spatial query if lat/lng provided
    let doctors;
    if (lat && lng) {
      doctors = await User.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            distanceField: 'distance',
            maxDistance: parseFloat(radius) * 1000, // Convert km to meters
            spherical: true,
            query: filter
          }
        },
        { $sort: { distance: 1 } },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        {
          $project: {
            password: 0
          }
        }
      ]);
      
      // Convert distance to km
      doctors = doctors.map(d => ({
        ...d,
        distance: d.distance ? (d.distance / 1000).toFixed(1) : null
      }));
    } else {
      // Standard query without geo
      const sortOptions = {
        rating: { rating: -1, totalReviews: -1 },
        experience: { experience: -1 },
        fee: { consultationFee: 1 },
        name: { name: 1 }
      };

      doctors = await User.find(filter)
        .select('-password')
        .sort(sortOptions[sortBy] || sortOptions.rating)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));
    }

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.json({
      doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/doctors/:id — get single doctor with full details
router.get('/doctors/:id', async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .select('-password');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/doctors/specializations — get list of available specializations
router.get('/specializations', async (req, res, next) => {
  try {
    const specializations = await User.distinct('specialization', { 
      role: 'doctor', 
      specialization: { $exists: true, $ne: '' } 
    });
    res.json(specializations.filter(Boolean).sort());
  } catch (err) {
    next(err);
  }
});

// GET /api/users/doctors/cities — get list of cities where doctors are available
router.get('/cities', async (req, res, next) => {
  try {
    const cities = await User.distinct('location.city', { 
      role: 'doctor',
      'location.city': { $exists: true, $ne: '' }
    });
    res.json(cities.filter(Boolean).sort());
  } catch (err) {
    next(err);
  }
});

// GET /api/users/patients — doctor-only
router.get('/patients', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { role: 'patient' };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await User.find(filter).select('-password');
    res.json(patients);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/location — update user's location
router.put('/location', protect, async (req, res, next) => {
  try {
    const { lat, lng, city, state, country, pincode, formattedAddress } = req.body;
    
    const locationUpdate = {
      'location.coordinates': [parseFloat(lng) || 0, parseFloat(lat) || 0],
      'location.city': city,
      'location.state': state,
      'location.country': country || 'India',
      'location.pincode': pincode,
      'location.formattedAddress': formattedAddress
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: locationUpdate },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
