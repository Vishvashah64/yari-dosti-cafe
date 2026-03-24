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
  paymentScreenshot: { type: String }, // Optional: Link to a photo
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  paymentStatus: { type: String, default: 'Unpaid' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);