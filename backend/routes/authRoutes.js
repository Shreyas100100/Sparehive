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

    res.json({ 
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
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

// Set user as regular user (admin only)
router.patch("/demote/:id", auth(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.role = "user";
    await user.save();

    res.json({ msg: "User role updated to regular user", user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Get current user information
router.get("/me", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Get specific user by ID (admin only)
router.get("/user/:id", auth(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Request manager role
router.post("/request-role", auth(["user"]), async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ 
        msg: "Please provide a detailed reason for your request (at least 10 characters)" 
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    
    // Update user with request details
    user.roleRequest = {
      requested: true,
      requestedRole: "manager",
      requestReason: reason,
      requestDate: new Date(),
      requestStatus: "pending"
    };
    
    await user.save();
    
    res.json({ msg: "Manager role request submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Get all role requests (admin only)
router.get("/role-requests", auth(["admin"]), async (req, res) => {
  try {
    const requests = await User.find({
      "roleRequest.requested": true,
      "roleRequest.requestStatus": "pending"
    }).select("-password");
    
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Approve or reject role request (admin only)
router.patch("/role-requests/:userId", auth(["admin"]), async (req, res) => {
  try {
    const { action } = req.body; // "approve" or "reject"
    
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ msg: "Invalid action" });
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    
    if (!user.roleRequest.requested || user.roleRequest.requestStatus !== "pending") {
      return res.status(400).json({ msg: "No pending role request for this user" });
    }
    
    if (action === "approve") {
      user.role = user.roleRequest.requestedRole;
      user.roleRequest.requestStatus = "approved";
    } else {
      user.roleRequest.requestStatus = "rejected";
    }
    
    await user.save();
    
    res.json({ 
      msg: `Role request ${action === "approve" ? "approved" : "rejected"}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleRequest: user.roleRequest
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


module.exports = router;
