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
    trim: true
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