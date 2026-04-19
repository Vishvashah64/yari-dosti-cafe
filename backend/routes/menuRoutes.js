const express = require("express");
const router = express.Router();
const multer = require('multer');

// 1. IMPORT STORAGE (Ensure this path is correct)
const { storage } = require("../config/cloudinary"); 
const upload = multer({ storage });

// 2. IMPORT CONTROLLERS
// Check if these names match exactly what is in menuController.js
const { getMenu, addMenuItem, deleteMenuItem, updateMenuItem, getMenuItemReviews } = require("../controllers/menuController");

// 3. IMPORT MIDDLEWARE
const { protect, admin } = require("../middleware/authMiddleware");

// DEBUG: If the app crashes, uncomment these to see which one is undefined
// console.log("getMenu:", getMenu);
// console.log("addMenuItem:", addMenuItem);
// console.log("protect:", protect);

router.get("/", getMenu); 
router.get('/reviews/:itemId', getMenuItemReviews);

// Ensure 'image' matches the name used in your React Frontend (formData.append('image', ...))
router.post("/", protect, admin, upload.single("image"), addMenuItem);

router.put("/:id", protect, admin, upload.single("image"), updateMenuItem);

router.delete("/:id", protect, admin, deleteMenuItem);

module.exports = router;
