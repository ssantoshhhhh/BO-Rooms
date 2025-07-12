const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }], // URLs or file paths
  ownerName: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  ownerWhatsapp: { type: String },
  category: { type: String, required: true }, // e.g., flat, penthouse
  area: { type: String, required: true },
  flatType: { type: String }, // e.g., 2BHK, 3BHK
  rent: { type: Number, required: true },
  status: { type: String, enum: ['available', 'rented'], default: 'available' },
  suitableFor: { type: Number, required: false, default: null }, // Number of people suitable for
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Room', roomSchema); 