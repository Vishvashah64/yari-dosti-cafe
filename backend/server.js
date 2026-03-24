const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin:"http://localhost:5173"
}));
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));
app.use("/api/booking", require("./routes/bookingRoutes"));

app.listen(process.env.PORT, () => {
  console.log("Server running on port 5000");
});
