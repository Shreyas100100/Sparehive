const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "manager", "user"],
    default: "user",
  },
  roleRequest: {
    requested: { type: Boolean, default: false },
    requestedRole: { type: String, enum: ["manager"], default: null },
    requestReason: { type: String, default: "" },
    requestDate: { type: Date, default: null },
    requestStatus: { 
      type: String, 
      enum: ["pending", "approved", "rejected", ""], 
      default: "" 
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);