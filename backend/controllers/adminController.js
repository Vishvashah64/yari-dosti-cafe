const User = require('../models/User');
const Order = require('../models/Order');

// --- USER MANAGEMENT ---
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user" });
    }
};

// --- ORDER MANAGEMENT ---
exports.deleteOrder = async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order removed from system" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting order" });
    }
};

// --- REVIEW/FEEDBACK MANAGEMENT ---
// We fetch only orders that actually have a rating
exports.getAllReviews = async (req, res) => {
    try {
        const ordersWithReviews = await Order.find({ "feedback.rating": { $gt: 0 } })
            .populate('userId', 'name email');
        res.json(ordersWithReviews);
    } catch (err) {
        res.status(500).json({ message: "Error fetching reviews" });
    }
};

// This clears the review text/rating without deleting the financial order record
exports.deleteReviewFromOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.feedback.comment = "";
            order.feedback.rating = 0;
            await order.save();
            res.json({ message: "Review cleared from order" });
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error clearing review" });
    }
};