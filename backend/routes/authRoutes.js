const express = require("express");
const router = express.Router();
const { register, login, updateUserProfile, forgotPassword, verifyOtp, resetPassword, updatePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Private route: Get current user profile (useful for frontend login state)
router.get("/profile", protect, async (req, res) => {
  res.json(req.user);
});
router.put('/profile', protect, updateUserProfile);
// 'protect' ensures the user is logged in before updating

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.put("/update-password", protect, updatePassword);
module.exports = router;