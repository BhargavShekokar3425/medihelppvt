const express = require('express');
const router = express.Router();
const EmergencyRequest = require('../models/EmergencyRequest.model');
const Hospital = require('../models/Hospital.model');
const { protect } = require('../middleware/auth');
const { broadcastEmergencyEmails } = require('../services/emailService');

// ─────────────────────────────────────────────────────────
// POST /api/emergency/sos
// Creates an emergency, emails selected (or all) hospitals, emits Socket.io event
// ─────────────────────────────────────────────────────────
router.post('/sos', protect, async (req, res, next) => {
  try {
    const { latitude, longitude, emergencyType, description, hospitalIds } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Location (lat/lng) is required.' });
    }

    // 1. Find hospitals — filter by IDs if provided, otherwise all accepting
    let query = { acceptingEmergencies: true };
    if (Array.isArray(hospitalIds) && hospitalIds.length > 0) {
      query._id = { $in: hospitalIds };
    }
    const hospitals = await Hospital.find(query);

    // 2. Create the emergency request (no single hospital assigned yet)
    const emergency = await EmergencyRequest.create({
      user: req.user._id,
      location: {
        latitude: parseFloat(Number(latitude).toFixed(9)),
        longitude: parseFloat(Number(longitude).toFixed(9)),
      },
      emergencyType: emergencyType || 'medical',
      description,
      notifiedHospitals: hospitals.map((h) => h._id),
      status: 'created',
    });

    // 3. Build accept base URL
    const baseUrl =
      process.env.BACKEND_URL ||
      `${req.protocol}://${req.get('host')}`;
    const acceptBaseUrl = `${baseUrl}/api/emergency`;

    // 4. Send emails to ALL hospitals in parallel
    const emailResults = await broadcastEmergencyEmails({
      hospitals,
      patient: {
        name: req.user.name || 'Unknown',
        email: req.user.email || '',
        phone: req.user.phone || '',
      },
      location: { latitude, longitude },
      emergencyType: emergencyType || 'medical',
      description,
      emergencyId: emergency._id.toString(),
      acceptBaseUrl,
    });

    // 5. Save email results back to the emergency
    emergency.emailResults = emailResults;
    emergency.status = 'notified';
    await emergency.save();

    // 6. Emit Socket.io event so any hospital user with the app open gets a real-time alert
    const io = req.app.get('io');
    if (io) {
      io.emit('emergency:new', {
        emergencyId: emergency._id,
        patient: {
          name: req.user.name,
          email: req.user.email,
        },
        location: { latitude, longitude },
        emergencyType: emergencyType || 'medical',
        description,
        mapsLink: `https://www.google.com/maps/search/?api=1&query=${Number(latitude).toFixed(9)},${Number(longitude).toFixed(9)}`,
        createdAt: emergency.createdAt,
      });
    }

    // 7. Respond
    const sentCount = emailResults.filter((r) => r.sent).length;
    console.log(`[SOS] Emergency ${emergency._id} created by ${req.user._id} — ${sentCount}/${emailResults.length} emails sent`);

    res.json({
      success: true,
      id: emergency._id,
      message: `SOS alert sent to ${hospitals.length} hospital(s). ${sentCount} email(s) delivered.`,
      emergency,
      emailsSent: sentCount,
      emailsTotal: emailResults.length,
      emailResults,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/emergency/:id/accept?hospitalId=xxx
// First-to-accept endpoint — clickable from email
// ─────────────────────────────────────────────────────────
router.get('/:id/accept', async (req, res, next) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) {
      return res.status(400).send(renderAcceptPage('Missing hospital ID.', false));
    }

    const emergency = await EmergencyRequest.findById(req.params.id);
    if (!emergency) {
      return res.status(404).send(renderAcceptPage('Emergency request not found.', false));
    }

    // Already accepted by another hospital?
    if (emergency.acceptedBy) {
      const winner = await Hospital.findById(emergency.acceptedBy);
      return res.status(409).send(
        renderAcceptPage(
          `This emergency has already been accepted by <strong>${winner?.name || 'another hospital'}</strong>.`,
          false
        )
      );
    }

    // Race condition safe: use findOneAndUpdate with a filter
    const updated = await EmergencyRequest.findOneAndUpdate(
      { _id: req.params.id, acceptedBy: { $exists: false } },
      {
        $set: {
          acceptedBy: hospitalId,
          acceptedAt: new Date(),
          hospital: hospitalId,
          status: 'acknowledged',
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(409).send(
        renderAcceptPage('Another hospital has already accepted this emergency.', false)
      );
    }

    // Notify the patient via Socket.io
    const io = req.app.get('io');
    const hospital = await Hospital.findById(hospitalId);

    if (io) {
      io.to(`user:${emergency.user.toString()}`).emit('emergency:accepted', {
        emergencyId: emergency._id,
        hospital: {
          id: hospital?._id,
          name: hospital?.name,
          contact: hospital?.contact,
          email: hospital?.email,
        },
        acceptedAt: updated.acceptedAt,
      });

      io.emit('emergency:claimed', {
        emergencyId: emergency._id,
        acceptedBy: hospital?.name || hospitalId,
      });
    }

    console.log(`[SOS] Emergency ${emergency._id} accepted by hospital ${hospital?.name || hospitalId}`);

    return res.send(
      renderAcceptPage(
        `<strong>${hospital?.name || 'Your hospital'}</strong> has successfully accepted this emergency.<br>
         Please dispatch an ambulance immediately.<br><br>
         <strong>Patient location:</strong><br>
         <a href="https://www.google.com/maps/search/?api=1&query=${emergency.location.latitude},${emergency.location.longitude}" 
            target="_blank" style="color:#1976d2;">
           Open in Google Maps
         </a>`,
        true
      )
    );
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/emergency/hospitals
// ─────────────────────────────────────────────────────────
router.get('/hospitals', async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;
    let hospitals = await Hospital.find();

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

// ─────────────────────────────────────────────────────────
// GET /api/emergency/:id
// ─────────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res, next) => {
  try {
    const emergency = await EmergencyRequest.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('hospital')
      .populate('acceptedBy')
      .populate('notifiedHospitals', 'name email contact');
    if (!emergency) return res.status(404).json({ message: 'Emergency request not found.' });
    res.json(emergency);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/emergency/:id/status
// ─────────────────────────────────────────────────────────
router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['acknowledged', 'dispatched', 'resolved', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const emergency = await EmergencyRequest.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency request not found.' });

    emergency.status = status;
    if (status === 'resolved') emergency.resolvedAt = new Date();
    await emergency.save();

    // Notify via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${emergency.user.toString()}`).emit('emergency:statusUpdate', {
        emergencyId: emergency._id,
        status,
      });
    }

    res.json({ success: true, emergency });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────
// Haversine distance helper (km)
// ─────────────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─────────────────────────────────────────────────────────
// Render a simple HTML page for accept/reject feedback
// ─────────────────────────────────────────────────────────
function renderAcceptPage(message, success) {
  const color = success ? '#2e7d32' : '#d32f2f';
  const icon = success ? '✅' : '❌';
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MediHelp Emergency</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;background:#f4f4f4;}
  .card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.12);padding:40px;max-width:500px;text-align:center;}
  .icon{font-size:64px;margin-bottom:16px;}
  .msg{font-size:18px;color:#333;line-height:1.6;}
  h2{color:${color};margin:0 0 16px;}
</style></head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h2>${success ? 'Emergency Accepted' : 'Cannot Accept'}</h2>
    <div class="msg">${message}</div>
  </div>
</body></html>`;
}

module.exports = router;
