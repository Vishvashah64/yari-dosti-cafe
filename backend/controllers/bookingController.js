const Booking = require("../models/Booking");

// @desc    Create a table booking
// @route   POST /api/booking
exports.createBooking = async (req, res) => {
  try {
    const { date, time, guests } = req.body;

    const booking = await Booking.create({
      userId: req.user._id, // Automatically taken from the logged-in user's token
      date,
      time,
      guests
    });

    res.status(201).json({ message: "Table booked successfully!", booking });
  } catch (error) {
    res.status(400).json({ message: "Booking failed. Please check your details." });
  }
};

// @desc    Get user's own bookings
// @route   GET /api/booking/mybookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};