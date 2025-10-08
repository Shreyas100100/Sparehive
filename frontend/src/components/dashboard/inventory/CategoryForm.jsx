import { useState, useEffect } from "react";
import API from "../../../services/api";

export default function CategoryForm({ category, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // If editing, populate form with category data
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || ""
      });
    }
  }, [category]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Normalize category name
      const normalizedName = formData.name.trim();
      
      // Check for duplicate category names before submitting
      const existingCategories = await API.get("/categories");
      
      if (!category) {
        // For new categories, check if the name already exists
        const duplicateCategory = existingCategories.data.find(c => 
          c.name.toLowerCase() === normalizedName.toLowerCase()
        );
        
        if (duplicateCategory) {
          setError("A category with this name already exists");
          setLoading(false);
          return;
        }
      } else if (category && category.name.toLowerCase() !== normalizedName.toLowerCase()) {
        // For edited categories, check if the new name already exists (if name changed)
        const duplicateCategory = existingCategories.data.find(c => 
          c.name.toLowerCase() === normalizedName.toLowerCase() && 
          c._id !== category._id
        );
        
        if (duplicateCategory) {
          setError("A category with this name already exists");
          setLoading(false);
          return;
        }
      }
      
      let response;
      const dataToSend = {
        ...formData,
        name: normalizedName
      };
      
      if (category) {
        // Update existing category
        response = await API.put(`/categories/${category._id}`, dataToSend);
      } else {
        // Create new category
        response = await API.post("/categories", dataToSend);
      }
      
      onSubmit(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
      <h3 className="text-lg font-medium mb-4">
        {category ? "Edit Category" : "Add New Category"}
      </h3>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name*
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
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
            {loading ? "Saving..." : category ? "Update Category" : "Add Category"}
          </button>
        </div>
      </form>
    </div>
  );
}