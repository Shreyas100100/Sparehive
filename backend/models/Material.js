const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  cupboard: {
    type: String,
    required: true,
    trim: true
  },
  shelf: {
    type: String,
    required: true,
    trim: true
  },
  currentStock: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: "pcs",
    trim: true,
    enum: ["pcs", "kg", "g", "mg", "L", "mL", "box", "carton", "pack", "pair", "set", "roll", "bottle", "bag", "cm", "m", "inch", "ft"],
    validate: {
      validator: function(v) {
        // Regular expression to ensure no emojis or special characters
        return /^[a-zA-Z0-9]+$/.test(v);
      },
      message: props => `${props.value} is not a valid unit! Only alphanumeric characters allowed.`
    }
  },
  notes: {
    type: String,
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Create a compound index for better search performance
materialSchema.index({ name: 1, category: 1 });

module.exports = mongoose.model("Material", materialSchema);