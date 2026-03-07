const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  address: String,
  contact: String,
  email: String,
  location: {
    latitude: Number,
    longitude: Number,
  },
  type: { type: String, enum: ['primary', 'secondary', 'tertiary'], default: 'primary' },
  services: [String],
  operatingHours: { type: String, default: '24x7' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('Hospital', hospitalSchema);
