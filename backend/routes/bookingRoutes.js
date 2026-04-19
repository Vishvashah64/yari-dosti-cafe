const express = require("express");
const router = express.Router();
const { createBooking, getMyBookings, getAllBookings, updateBookingStatus, cancelBooking } = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking); // Must be logged in to book
router.get("/my-bookings", protect, getMyBookings); // See only your own bookings
router.get("/all", protect, getAllBookings);
router.put("/:id/status", protect, updateBookingStatus);
router.delete("/:id", protect, cancelBooking); // New route for user

module.exports = router;