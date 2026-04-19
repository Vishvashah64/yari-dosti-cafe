const Order = require("../models/Order");
const Menu = require("../models/Menu");
const sendEmail = require("../utils/sendEmail");
const { getVerificationTemplate } = require("../utils/emailTemplate");

// @desc    Create new order
// @route   POST /api/order
// Updated createOrder
exports.createOrder = async (req, res) => {
  try {
    const { items, address, phone } = req.body;

    let calculatedTotal = 0;
    const finalOrderItems = [];
    for (const item of items) {
      const menuItem = await Menu.findById(item.menuId);
      if (menuItem) {
        calculatedTotal += menuItem.price * item.quantity;
        finalOrderItems.push({ menuItemId: menuItem._id, name: menuItem.name, qty: item.quantity, price: menuItem.price });
      }
    }

    const newOrder = new Order({
      userId: req.user._id,
      items: finalOrderItems,
      totalAmount: calculatedTotal,
      shippingAddress: address,
      shippingPhone: phone,
      paymentMethod: "COD",
      paymentStatus: "Unpaid",
      status: "Pending"
      // OTP logic removed from here
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      orderId: savedOrder._id,
      message: "Order placed successfully!"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendCodOtp = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    order.otp = otp;
    order.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await order.save();

    // Send Email
    const htmlContent = getVerificationTemplate(otp);
    await sendEmail(req.user.email, "Verify Your Order - Yari Dosti", htmlContent);

    res.json({ message: "OTP sent to your email!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyOrderOtp = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check OTP
    if (order.otp === otp && order.otpExpires > Date.now()) {
      order.paymentStatus = "Unpaid"; // Verified COD
      order.status = "Confirmed";    // Now Admin knows it's a real order
      order.otp = undefined;         // Clear OTP
      await order.save();

      res.json({ message: "Payment Verified & Order Confirmed!" });
    } else {
      res.status(400).json({ message: "Invalid or expired OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

// @desc    Update order status (Admin Only)
// @route   PUT /api/order/:id
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ALL orders for Admin Dashboard
exports.getAllOrders = async (req, res) => {
  try {
    // .populate('userId', 'name phone') brings in the customer's name and phone
    const orders = await Order.find({}).populate('userId', 'name phone');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all orders" });
  }
};

// controllers/orderController.js

// 1. Process Payment & Mark as Paid
// controllers/orderController.js
// controllers/orderController.js

exports.processPayment = async (req, res) => {
  try {
    const { transactionId, paymentStatus } = req.body; // Added paymentStatus here
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Logic: If Admin sends a status, use it. Otherwise, default to Pending.
    order.transactionId = transactionId || order.transactionId;
    order.paymentStatus = paymentStatus || 'Pending Verification';

    await order.save();
    res.status(200).json({
      message: "Payment updated successfully",
      paymentStatus: order.paymentStatus
    });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// 2. Generate Data for Hard Copy (Print)
exports.getBillDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name phone address');
    if (!order) return res.status(404).json({ message: "Bill not found" });

    // In a real app, you could use 'pdfkit' here to generate a file.
    // For now, we send the structured data for the frontend to print.
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error generating bill" });
  }
};

// @desc    Add feedback to an order
// @route   PUT /api/order/:id/feedback
exports.addOrderFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure only the owner can rate their own order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    order.feedback = {
      rating: Number(rating),
      comment: comment || ""
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error saving feedback" });
  }
};

// controllers/orderController.js

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Allow cancellation only if not already completed or shipped
    if (order.status === 'Completed' || order.status === 'Shipped') {
      return res.status(400).json({ message: "Cannot cancel a completed/shipped order." });
    }

    order.status = 'Cancelled';
    await order.save(); // Just update, don't delete!
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};