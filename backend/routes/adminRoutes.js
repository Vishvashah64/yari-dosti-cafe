const express = require('express');
const router = express.Router();

// Import Controllers
const adminController = require('../controllers/adminController');

// --- THE FIX IS HERE ---
// Change isAdmin to admin to match your middleware file
const { protect, admin } = require('../middleware/authMiddleware');

// Secure all routes
router.use(protect);
router.use(admin); // Use 'admin' here as well

// --- ROUTES ---
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.delete('/orders/:id', adminController.deleteOrder);
router.get('/reviews', adminController.getAllReviews);
router.delete('/orders/clear-review/:id', adminController.deleteReviewFromOrder);

module.exports = router;