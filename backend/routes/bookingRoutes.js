const express = require("express");
const router = express.Router();
const { createBooking, getMyBookings } = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking); // Must be logged in to book
router.get("/my-bookings", protect, getMyBookings); // See only your own bookings

module.exports = router;