const express = require("express");
const Category = require("../models/Category");
const auth = require("../middleware/auth");
const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Create a new category (admin/manager only)
router.post("/", auth(["admin", "manager"]), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingCategory) {
      return res.status(400).json({ msg: "Category already exists" });
    }
    
    const newCategory = new Category({
      name,
      description: description || "",
      createdBy: req.user.id
    });
    
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Update a category (admin/manager only)
router.put("/:id", auth(["admin", "manager"]), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if new name already exists (if name is being changed)
    if (name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        return res.status(400).json({ msg: "Category name already exists" });
      }
    }
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }
    
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    
    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Delete a category (admin only)
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }
    
    // Check if any materials use this category
    const Material = require("../models/Material");
    const materialCount = await Material.countDocuments({ category: req.params.id });
    
    if (materialCount > 0) {
      return res.status(400).json({ 
        msg: `Cannot delete category. It is used by ${materialCount} material(s).`
      });
    }
    
    await category.remove();
    res.json({ msg: "Category removed" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;