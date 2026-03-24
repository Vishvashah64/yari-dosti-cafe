const Order = require("../models/Order");
const Menu = require("../models/Menu");

// @desc    Create new order
// @route   POST /api/order
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let calculatedTotal = 0;
    const finalOrderItems = [];

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuId);
      if (menuItem) {
        // Calculate the price for this item
        const itemSubtotal = menuItem.price * item.quantity;
        calculatedTotal += itemSubtotal;

        finalOrderItems.push({
          menuItemId: menuItem._id,
          name: menuItem.name,
          qty: item.quantity,
          price: menuItem.price
        });
      }
    }

    // CRITICAL: Ensure this matches your Schema (totalAmount, not totalPrice)
    const newOrder = new Order({
      userId: req.user._id,
      items: finalOrderItems,
      totalAmount: calculatedTotal // <-- Use this name
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
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

    // Important: Only allow cancellation if it's still pending
    if (order.status !== 'Pending') {
      return res.status(400).json({ message: "Order is already being prepared!" });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};