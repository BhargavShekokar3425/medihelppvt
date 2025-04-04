/*

Great! Here's the backend Express route file you'll need: sosRoutes.js
This file will:

Receive the user's location (latitude, longitude)

Find hospitals within a 5 km radius (placeholder logic for now)

Send notifications to hospitals (SMS/email – placeholder logic)


*/


const express = require('express');
const router = express.Router();

// Sample hospital data (replace with DB later)
const hospitals = [
  {
    name: "City Hospital",
    latitude: 26.9124,
    longitude: 75.7873,
    email: "cityhospital@example.com",
    phone: "+911234567890"
  },
  {
    name: "Metro Hospital",
    latitude: 26.9180,
    longitude: 75.8000,
    email: "metrohospital@example.com",
    phone: "+911112223334"
  },
  {
    name: "Green Health Care",
    latitude: 26.9040,
    longitude: 75.7900,
    email: "greenhealth@example.com",
    phone: "+919998887776"
  }
];

// Haversine formula to calculate distance in km between two coordinates
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Route: /api/sos
router.post('/', (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: "Location is required" });
  }

  // Find nearby hospitals within 5 km
  const nearbyHospitals = hospitals.filter((hospital) => {
    const distance = getDistanceFromLatLonInKm(
      latitude,
      longitude,
      hospital.latitude,
      hospital.longitude
    );
    return distance <= 5;
  });

  // Simulate sending notifications (to be replaced with actual logic)
  nearbyHospitals.forEach((hospital) => {
    console.log(`Sending notification to ${hospital.name} at ${hospital.email}`);
    // TODO: integrate with email/SMS API like Twilio or Nodemailer
  });

  res.status(200).json({
    message: "SOS received. Notifications sent to nearby hospitals.",
    nearbyHospitals,
  });
});

module.exports = router;


/*
🛠️ Setup in backend/index.js or app.js
Add this in your main Express file to use the above routes:


const express = require('express');
const cors = require('cors');
const sosRoutes = require('./routes/sosRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/sos', sosRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

*/

/*

✅ API Test Example
Send a POST request to:

bash
Copy
Edit
http://localhost:5000/api/sos
Request Body (JSON):

json
Copy
Edit
{
  "latitude": 26.9125,
  "longitude": 75.7878
}
Response:

json
Copy
Edit
{
  "message": "SOS received. Notifications sent to nearby hospitals.",
  "nearbyHospitals": [
    {
      "name": "City Hospital",
      "latitude": 26.9124,
      "longitude": 75.7873,
      "email": "cityhospital@example.com",
      "phone": "+911234567890"
    }
  ]
}

*/