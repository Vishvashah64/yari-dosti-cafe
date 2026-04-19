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

// Add these to your existing controller
// @desc    Get all bookings (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    // Populate userId to get the name of the customer
    const bookings = await Booking.find().populate('userId', 'name').sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

// @desc    Update booking status (Admin only)
// Admin: Confirm booking and assign table
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, tableNumber } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, tableNumber },
      { new: true }
    );
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: "Failed to update" });
  }
};

// User: Cancel their own booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== 'Pending') return res.status(400).json({ message: "Cannot cancel confirmed booking" });

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling" });
  }
};