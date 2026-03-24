const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }, // The URL string from Unsplash/Cloudinary
  category: { 
    type: String, 
    required: true,
  },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);