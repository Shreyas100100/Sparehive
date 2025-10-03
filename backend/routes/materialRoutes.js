const express = require("express");
const Material = require("../models/Material");
const Category = require("../models/Category");
const auth = require("../middleware/auth");
const router = express.Router();

// Get all materials with optional filters
router.get("/", async (req, res) => {
  try {
    const { category, search, lowStock } = req.query;
    
    let query = {};
    
    // Apply filters if provided
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    
    if (lowStock === "true") {
      query.$expr = { $lte: ["$currentStock", "$minimumStock"] };
    }
    
    const materials = await Material.find(query)
      .populate("category", "name")
      .populate("createdBy", "name")
      .populate("lastUpdatedBy", "name")
      .sort({ name: 1 });
    
    res.json(materials);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Get a single material by ID
router.get("/:id", async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate("category", "name")
      .populate("createdBy", "name")
      .populate("lastUpdatedBy", "name");
    
    if (!material) {
      return res.status(404).json({ msg: "Material not found" });
    }
    
    res.json(material);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Create a new material (admin/manager only)
router.post("/", auth(["admin", "manager"]), async (req, res) => {
  try {
    const { 
      name, category, price, location, cupboard, 
      shelf, currentStock, minimumStock, unit, notes 
    } = req.body;
    
    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ msg: "Invalid category" });
    }
    
    const newMaterial = new Material({
      name,
      category,
      price,
      location,
      cupboard,
      shelf,
      currentStock: currentStock || 0,
      minimumStock,
      unit: unit || "pcs",
      notes: notes || "",
      createdBy: req.user.id,
      lastUpdatedBy: req.user.id
    });
    
    await newMaterial.save();
    
    // Populate references for the response
    const populatedMaterial = await Material.findById(newMaterial._id)
      .populate("category", "name")
      .populate("createdBy", "name")
      .populate("lastUpdatedBy", "name");
    
    res.status(201).json(populatedMaterial);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Update a material (admin/manager only)
router.put("/:id", auth(["admin", "manager"]), async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ msg: "Material not found" });
    }
    
    const { 
      name, category, price, location, cupboard, 
      shelf, currentStock, minimumStock, unit, notes 
    } = req.body;
    
    // Update fields if provided
    if (name) material.name = name;
    
    if (category) {
      // Validate category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ msg: "Invalid category" });
      }
      material.category = category;
    }
    
    if (price !== undefined) material.price = price;
    if (location) material.location = location;
    if (cupboard) material.cupboard = cupboard;
    if (shelf) material.shelf = shelf;
    if (currentStock !== undefined) material.currentStock = currentStock;
    if (minimumStock !== undefined) material.minimumStock = minimumStock;
    if (unit) material.unit = unit;
    if (notes !== undefined) material.notes = notes;
    
    // Update the lastUpdatedBy field
    material.lastUpdatedBy = req.user.id;
    
    await material.save();
    
    // Populate references for the response
    const updatedMaterial = await Material.findById(material._id)
      .populate("category", "name")
      .populate("createdBy", "name")
      .populate("lastUpdatedBy", "name");
    
    res.json(updatedMaterial);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Delete a material (admin only)
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ msg: "Material not found" });
    }
    
    await material.remove();
    res.json({ msg: "Material removed" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Update stock quantity (admin/manager only)
router.patch("/:id/stock", auth(["admin", "manager"]), async (req, res) => {
  try {
    const { quantity, action } = req.body;
    
    if (!["add", "remove", "set"].includes(action)) {
      return res.status(400).json({ msg: "Invalid action. Use 'add', 'remove', or 'set'." });
    }
    
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ msg: "Quantity must be a positive number" });
    }
    
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ msg: "Material not found" });
    }
    
    // Update stock based on action
    if (action === "add") {
      material.currentStock += quantity;
    } else if (action === "remove") {
      if (material.currentStock < quantity) {
        return res.status(400).json({ msg: "Not enough stock available" });
      }
      material.currentStock -= quantity;
    } else if (action === "set") {
      material.currentStock = quantity;
    }
    
    // Update the lastUpdatedBy field
    material.lastUpdatedBy = req.user.id;
    
    await material.save();
    
    res.json({ 
      msg: "Stock updated successfully", 
      currentStock: material.currentStock 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;