const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Signup
// Accepts: { name, email, password, role, secret }
router.post("/signup", async (req, res) => {
  const { name, email, password, role, secret } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let finalRole = "user"; // default

    if (role === "admin") {
      if (secret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ msg: "Invalid admin secret" });
      }
      finalRole = "admin";
    }

    // If someone requests manager, still register them as user by default
    if (role === "manager") {
      finalRole = "user";
    }

    user = new User({ name, email, password: hashedPassword, role: finalRole });
    await user.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Login
// Accepts: { email, password }
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Protected test routes
router.get("/admin", auth(["admin"]), (req, res) => {
  res.json({ msg: "Welcome Admin!" });
});

router.get("/manager", auth(["manager", "admin"]), (req, res) => {
  res.json({ msg: "Welcome Manager!" });
});

router.get("/user", auth(["user", "manager", "admin"]), (req, res) => {
  res.json({ msg: "Welcome User!" });
});

// Get all users (admin only) - returns users without passwords
router.get("/users", auth(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Promote user to manager (admin only)
router.patch("/promote/:id", auth(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.role = "manager";
    await user.save();

    res.json({ msg: "User promoted to manager", user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
