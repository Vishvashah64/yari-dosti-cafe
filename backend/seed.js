const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Menu = require("./models/Menu");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected for Seeding..."))
  .catch(err => console.log(err));

const menuItems = [
  { name: "Caramel Macchiato", price: 5.50, category: "Coffee" },
  { name: "Hazelnut Latte", price: 4.75, category: "Coffee" },
  { name: "Blueberry Muffin", price: 3.25, category: "Bakery" },
  { name: "Avocado Toast", price: 8.50, category: "Breakfast" },
  { name: "Classic Masala Chai", price: 2.50, category: "Tea" },
  { name: "Paneer Tikka Sandwich", price: 6.99, category: "Snacks" },
];

const seedDB = async () => {
  await Menu.deleteMany({}); // Clears existing menu
  await Menu.insertMany(menuItems);
  console.log("✅ Database Seeded with Cafe Items!");
  process.exit();
};

seedDB();