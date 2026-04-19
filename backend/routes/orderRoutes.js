const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  updateOrderStatus,
  getAllOrders,
  processPayment,
  getBillDetails,
  addOrderFeedback,
  cancelOrder,
  verifyOrderOtp,
  sendCodOtp
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/all", protect, admin, getAllOrders);
router.post('/', protect, createOrder);
// Add this route
router.post('/:id/send-otp', protect, sendCodOtp);
router.post('/verify-otp', protect, verifyOrderOtp);
router.get('/myorders', protect, getMyOrders)
router.put("/:id/status", protect, admin, updateOrderStatus); // Only Admin can change status (Pending -> Preparing -> Completed)
router.delete('/:id/cancel', cancelOrder)
router.put('/:id/pay', protect, processPayment);
router.get('/:id/bill', protect, getBillDetails);
router.put('/:id/feedback', protect, addOrderFeedback);
module.exports = router;