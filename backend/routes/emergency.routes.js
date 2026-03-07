const express = require('express');
const router = express.Router();
const EmergencyRequest = require('../models/EmergencyRequest.model');
const Hospital = require('../models/Hospital.model');
const { protect } = require('../middleware/auth');

// POST /api/emergency/sos
router.post('/sos', protect, async (req, res, next) => {
  try {
    const { latitude, longitude, hospitalId, emergencyType, description } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Location (lat/lng) is required.' });
    }

    const emergency = await EmergencyRequest.create({
      user: req.user._id,
      location: { latitude, longitude },
      hospital: hospitalId || undefined,
      emergencyType: emergencyType || 'medical',
      description,
    });

    const hospital = hospitalId ? await Hospital.findById(hospitalId) : null;

    console.log(`SOS created: ${emergency._id} by user ${req.user._id}`);

    res.json({
      success: true,
      id: emergency._id,
      message: 'SOS alert created successfully.',
      emergency,
      hospital,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/emergency/hospitals
router.get('/hospitals', async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;
    let hospitals = await Hospital.find();

    // Optional: filter by distance (Haversine)
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const maxKm = parseFloat(radius) || 50;

      hospitals = hospitals.filter((h) => {
        if (!h.location?.latitude || !h.location?.longitude) return false;
        const dist = haversine(lat, lng, h.location.latitude, h.location.longitude);
        h._doc.distance = Math.round(dist * 10) / 10;
        return dist <= maxKm;
      });

      hospitals.sort((a, b) => (a._doc.distance || 0) - (b._doc.distance || 0));
    }

    res.json(hospitals);
  } catch (err) {
    next(err);
  }
});

// GET /api/emergency/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const emergency = await EmergencyRequest.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('hospital');
    if (!emergency) return res.status(404).json({ message: 'Emergency request not found.' });
    res.json(emergency);
  } catch (err) {
    next(err);
  }
});

// PUT /api/emergency/:id/status
router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['acknowledged', 'dispatched', 'resolved', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const emergency = await EmergencyRequest.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency request not found.' });

    emergency.status = status;
    if (status === 'resolved') emergency.resolvedAt = new Date();
    await emergency.save();

    res.json({ success: true, emergency });
  } catch (err) {
    next(err);
  }
});

// Haversine distance helper (km)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = router;
