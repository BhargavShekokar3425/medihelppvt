// Sample hospital data (you can replace this with a real database later)
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
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  // Controller function to handle SOS
  const handleSOS = (req, res) => {
    const { latitude, longitude } = req.body;
  
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and Longitude are required." });
    }
  
    // Filter hospitals within 5 km radius
    const nearbyHospitals = hospitals.filter((hospital) => {
      const distance = getDistanceFromLatLonInKm(
        latitude,
        longitude,
        hospital.latitude,
        hospital.longitude
      );
      return distance <= 5;
    });
  
    // Placeholder notification logic
    nearbyHospitals.forEach((hospital) => {
      console.log(`📨 Notification sent to ${hospital.name} at ${hospital.email}`);
      // TODO: Add actual notification logic (email/SMS)
    });
  
    res.status(200).json({
      message: "SOS received. Notifications sent to nearby hospitals.",
      nearbyHospitals,
    });
  };
  
  module.exports = { handleSOS };
  