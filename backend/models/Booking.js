const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Confirmed"],
    default: "Pending"
  }
});

module.exports = mongoose.model("Booking", bookingSchema);
