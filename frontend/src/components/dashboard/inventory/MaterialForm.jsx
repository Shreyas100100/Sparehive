import { useState, useEffect } from "react";
import API from "../../../services/api";

export default function MaterialForm({ material, categories, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    location: "",
    cupboard: "",
    shelf: "",
    currentStock: 0,
    minimumStock: 1,
    unit: "pcs",
    notes: "",
    stockNote: "" // Added for stock change notes
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({ name: "", description: "" });
  const [categoryError, setCategoryError] = useState("");
  
  // If editing, populate form with material data
  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || "",
        category: material.category?._id || material.category || "",
        price: material.price || "",
        location: material.location || "",
        cupboard: material.cupboard || "",
        shelf: material.shelf || "",
        currentStock: material.currentStock || 0,
        minimumStock: material.minimumStock || 1,
        unit: material.unit || "pcs",
        notes: material.notes || "",
        stockNote: "" // Always empty for edits
      });
    }
  }, [material]);
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) : value
    });
  };
  
  // Function to handle adding a new category
  const handleAddCategory = async () => {
    if (!newCategoryData.name.trim()) {
      setCategoryError("Category name is required");
      return;
    }
    
    try {
      setCategoryError("");
      
      // Normalize category name
      const normalizedName = newCategoryData.name.trim();
      
      // Check for duplicate category names
      const existingCategories = await API.get("/categories");
      const duplicateCategory = existingCategories.data.find(c => 
        c.name.toLowerCase() === normalizedName.toLowerCase()
      );
      
      if (duplicateCategory) {
        setCategoryError("A category with this name already exists");
        return;
      }
      
      // Create new category
      const response = await API.post("/categories", {
        name: normalizedName,
        description: newCategoryData.description.trim()
      });
      
      // Add the new category to the form data
      setFormData({
        ...formData,
        category: response.data._id
      });
      
      // Close the category form
      setShowAddCategory(false);
      setNewCategoryData({ name: "", description: "" });
      
      // Notify parent component to refresh categories list
      if (onSubmit) {
        // We don't want to submit the form yet, just refresh the categories
        // Let's assume onSubmit can handle a special case to just refresh categories
        onSubmit({ refreshCategories: true });
      }
    } catch (err) {
      setCategoryError(err.response?.data?.msg || "Failed to create category");
      console.error(err);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      let response;
      
      // Extract stockNote from formData before sending to API
      const { stockNote, ...dataToSend } = formData;
      
      // Check for duplicate material names within the same category before submitting
      const existingMaterials = await API.get("/materials");
      
      if (!material) { // Only check for new materials
        const duplicateMaterial = existingMaterials.data.find(m => 
          m.name.toLowerCase() === formData.name.trim().toLowerCase() && 
          m.category._id === formData.category
        );
        
        if (duplicateMaterial) {
          setError("A material with this name already exists in the selected category");
          setLoading(false);
          return;
        }
      } else if (material && 
                (material.name.toLowerCase() !== formData.name.trim().toLowerCase() || 
                 material.category._id !== formData.category)) {
        // Check if edited material name already exists in the category (if name or category changed)
        const duplicateMaterial = existingMaterials.data.find(m => 
          m.name.toLowerCase() === formData.name.trim().toLowerCase() && 
          m.category._id === formData.category &&
          m._id !== material._id
        );
        
        if (duplicateMaterial) {
          setError("A material with this name already exists in the selected category");
          setLoading(false);
          return;
        }
      }
      
      if (material) {
        // For edits, include the stock note if stock was changed
        if (material.currentStock !== formData.currentStock) {
          dataToSend.note = stockNote || "Updated via edit form";
        }
        
        // Update existing material
        response = await API.put(`/materials/${material._id}`, dataToSend);
      } else {
        // For new materials, include the stock note if initial stock > 0
        if (formData.currentStock > 0) {
          dataToSend.note = stockNote || "Initial stock";
        }
        
        // Create new material
        response = await API.post("/materials", dataToSend);
      }
      
      // Reset the category form if it was open
      setShowAddCategory(false);
      setNewCategoryData({ name: "", description: "" });
      setCategoryError("");
      
      onSubmit(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save material");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
      <h3 className="text-lg font-medium mb-4">
        {material ? "Edit Material" : "Add New Material"}
      </h3>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material Name*
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category*
          </label>
          {!showAddCategory ? (
            <div className="flex items-center">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddCategory(true)}
                className="ml-2 text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New
              </button>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Add New Category</h4>
              
              {categoryError && (
                <div className="text-xs bg-red-50 text-red-700 p-2 rounded-md mb-2">
                  {categoryError}
                </div>
              )}
              
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Name*
                </label>
                <input
                  type="text"
                  value={newCategoryData.name}
                  onChange={(e) => setNewCategoryData({...newCategoryData, name: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                  required
                />
              </div>
              
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newCategoryData.description}
                  onChange={(e) => setNewCategoryData({...newCategoryData, description: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                />
              </div>
              
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategoryData({ name: "", description: "" });
                    setCategoryError("");
                  }}
                  className="px-2 py-1 text-xs text-gray-700 bg-white border border-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-2 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Add Category
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price*
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location*
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cupboard*
          </label>
          <input
            type="text"
            name="cupboard"
            value={formData.cupboard}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shelf*
          </label>
          <input
            type="text"
            name="shelf"
            value={formData.shelf}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Stock
          </label>
          <input
            type="number"
            name="currentStock"
            value={formData.currentStock}
            onChange={handleChange}
            min="0"
            className="w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Stock*
          </label>
          <input
            type="number"
            name="minimumStock"
            value={formData.minimumStock}
            onChange={handleChange}
            min="0"
            className="w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit*
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm"
            required
          >
            <option value="pcs">pcs (pieces)</option>
            <option value="kg">kg (kilogram)</option>
            <option value="g">g (gram)</option>
            <option value="mg">mg (milligram)</option>
            <option value="L">L (liter)</option>
            <option value="mL">mL (milliliter)</option>
            <option value="box">box</option>
            <option value="carton">carton</option>
            <option value="pack">pack</option>
            <option value="pair">pair</option>
            <option value="set">set</option>
            <option value="roll">roll</option>
            <option value="bottle">bottle</option>
            <option value="bag">bag</option>
            <option value="cm">cm (centimeter)</option>
            <option value="m">m (meter)</option>
            <option value="inch">inch</option>
            <option value="ft">ft (foot)</option>
          </select>
        </div>
        
        {/* Stock Note Field - Show when editing and stock changed, or when adding with initial stock */}
        {((material && material.currentStock !== formData.currentStock) || 
          (!material && formData.currentStock > 0)) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Change Note
            </label>
            <input
              type="text"
              name="stockNote"
              value={formData.stockNote}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm"
              placeholder={material ? "Reason for stock change" : "Initial stock note"}
            />
          </div>
        )}
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm"
            rows="3"
          />
        </div>
        
        <div className="md:col-span-2 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : material ? "Update Material" : "Add Material"}
          </button>
        </div>
      </form>
    </div>
  );
}