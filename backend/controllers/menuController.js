const Menu = require("../models/Menu");
const Order = require("../models/Order");

// @desc    Get all menu items
// @route   GET /api/menu
exports.getMenu = async (req, res) => {
  try {
    const { category } = req.query; // Allow filtering by category (e.g., /api/menu?category=Coffee)
    const filter = category ? { category } : {};

    const items = await Menu.find(filter).sort({ category: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server Error: Could not fetch menu" });
  }
};

// @desc    Add new menu item (Admin Only)
// @route   POST /api/menu
// @desc    Add new menu item (Admin Only)
exports.addMenuItem = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    // req.file.path contains the Cloudinary image URL
    const imageUrl = req.file ? req.file.path : "";

    const newItem = await Menu.create({
      name,
      price,
      category,
      description,
      image: imageUrl
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete menu item (Admin Only)
// @route   DELETE /api/menu/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.deleteOne();
    res.json({ message: "Item removed from menu" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update menu item (Admin Only)
// @route   PUT /api/menu/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    const item = await Menu.findById(req.params.id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    // Update text fields
    item.name = name || item.name;
    item.price = price || item.price;
    item.category = category || item.category;
    item.description = description || item.description;

    // Update image ONLY if a new file was uploaded
    if (req.file) {
      item.image = req.file.path;
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMenuItemReviews = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Ensure this matches your Order Schema: "items.menuItemId"
    const orders = await Order.find({
      "items.menuItemId": itemId,
      "feedback.rating": { $gt: 0 }
    }).populate('userId', 'name');

    const reviews = orders.map(order => ({
      userName: order.userId ? order.userId.name : "Guest",
      rating: order.feedback.rating,
      comment: order.feedback.comment,
      date: order.feedback.createdAt || order.createdAt
    }));

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};