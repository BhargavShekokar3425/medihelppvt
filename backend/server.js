const express = require('express');
const cors = require('cors');
const sosRoutes = require('./routes/sosRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// Routes
app.use('/api/sos', sosRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the MediHelp Backend!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
