const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// CORS: allow only your frontend in production (set FRONTEND_URL in env)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  })
);

// Basic health endpoint
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ msg: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
