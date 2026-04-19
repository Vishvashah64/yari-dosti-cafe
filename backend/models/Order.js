const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
      name: String,
      qty: Number,
      price: Number,
    }
  ],
  transactionId: { type: String }, // Store the UPI Ref No.
  paymentMethod: { type: String, default: "COD" }, // Optional: Link to a photo
  isPaid: { type: Boolean, default: false },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  paymentStatus: { type: String, default: 'Unpaid' },
  shippingAddress: { type: String }, // To store where the order goes
  shippingPhone: { type: String },   // To store contact number
  otp: { type: String },             // For COD verification
  otpExpires: { type: Date },
  feedback: {
    rating: { type: Number, default: 0 },
    comment: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);