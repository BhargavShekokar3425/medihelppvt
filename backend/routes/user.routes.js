const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');
const { protect, authorize } = require('../middleware/auth');

// ---- Multer config for profile photo uploads ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|avif/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error('Only image files (jpg, png, gif, webp) are allowed.'));
  }
});

// GET /api/users/profile — get current user (no password)
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/profile — update current user's profile
router.put('/profile/:id?', protect, async (req, res, next) => {
  try {
    // Prevent changing password / role via this endpoint
    const { password, role, _id, __v, ...updateData } = req.body;
    
    // Role-specific field restrictions
    if (req.user.role === 'patient') {
      // Patients can update these fields
      const allowed = ['name', 'phone', 'gender', 'dateOfBirth', 'bloodGroup', 
                        'allergies', 'medicalConditions', 'address', 
                        'location', 'avatar', 'profileImage'];
      Object.keys(updateData).forEach(key => {
        if (!allowed.includes(key)) delete updateData[key];
      });
    } else if (req.user.role === 'doctor') {
      // Doctors can update these fields
      const allowed = ['name', 'phone', 'gender', 'dateOfBirth', 'bio',
                        'qualifications', 'experience', 'languages',
                        'clinic', 'location', 'consultationFee',
                        'avatar', 'profileImage', 'specialization'];
      Object.keys(updateData).forEach(key => {
        if (!allowed.includes(key)) delete updateData[key];
      });
    }
    
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST /api/users/profile/photo — upload profile photo
router.post('/profile/photo', protect, upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    const photoUrl = `/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: photoUrl, profileImage: photoUrl },
      { new: true }
    ).select('-password');
    
    res.json({ photoUrl, user });
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

    // SECURITY: Only expose public-facing fields for doctors
    const publicDoctorFields = 'name specialization experience qualifications consultationFee rating totalReviews bio languages avatar profileImage location.city location.state clinic.name clinic.address clinic.phone clinic.timings clinic.location workingDays';

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
            password: 0,
            blockedSlots: 0,
            breakTime: 0,
            workingHours: 0,
            email: 0,
            phone: 0,
            slotDuration: 0,
            medicalConditions: 0,
            allergies: 0,
            bloodGroup: 0,
            dateOfBirth: 0
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
        .select(publicDoctorFields)
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

// GET /api/users/doctors/:id — get single doctor with public details only
router.get('/doctors/:id', async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .select('name specialization experience qualifications consultationFee rating totalReviews bio languages avatar profileImage location.city location.state clinic.name clinic.address clinic.phone clinic.timings workingDays');
    
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

// GET /api/users/patients — doctor can only see THEIR OWN patients
// SECURITY: Only returns patients who have had appointments with this doctor
router.get('/patients', protect, authorize('doctor'), async (req, res, next) => {
  try {
    const { search } = req.query;
    
    // Find unique patient IDs from this doctor's appointments
    const patientIds = await Appointment.distinct('patient', { doctor: req.user._id });
    
    const filter = { 
      _id: { $in: patientIds },
      role: 'patient' 
    };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Only return relevant medical details, not full profile
    const patients = await User.find(filter)
      .select('name email phone gender bloodGroup allergies medicalConditions dateOfBirth avatar');
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
