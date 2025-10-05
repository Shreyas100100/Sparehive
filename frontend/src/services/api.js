import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Stock management functions
export const stockAPI = {
  // Add stock to a material
  addStock: (materialId, quantity) => 
    API.patch(`/materials/${materialId}/stock`, { quantity, action: 'add' }),
  
  // Remove stock from a material
  removeStock: (materialId, quantity) =>
    API.patch(`/materials/${materialId}/stock`, { quantity, action: 'remove' }),
  
  // Set exact stock amount for a material
  setStock: (materialId, quantity) =>
    API.patch(`/materials/${materialId}/stock`, { quantity, action: 'set' }),
  
  // Update stock with custom action
  updateStock: (materialId, quantity, action) =>
    API.patch(`/materials/${materialId}/stock`, { quantity, action })
};

export default API;
