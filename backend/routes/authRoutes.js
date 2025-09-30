const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Signup
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

    // manager requests are downgraded to user until approved
    if (role === "manager") {
      finalRole = "user";
    }

    user = new User({ name, email, password: hashedPassword, role: finalRole });
    await user.save();

    res.json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


// Login
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
    res.status(500).send("Server error");
  }
});

// Protected routes
router.get("/admin", auth(["admin"]), (req, res) => {
  res.json({ msg: "Welcome Admin!" });
});

router.get("/manager", auth(["manager", "admin"]), (req, res) => {
  res.json({ msg: "Welcome Manager!" });
});

router.get("/user", auth(["user", "manager", "admin"]), (req, res) => {
  res.json({ msg: "Welcome User!" });
});

// Promote user to manager (admin only)
router.patch("/promote/:id", auth(["admin"]), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "manager" },
      { new: true }
    );
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "User promoted to manager", user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


module.exports = router;
