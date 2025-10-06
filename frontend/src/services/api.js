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
  addStock: (materialId, quantity, reason = "", notes = "") => 
    API.patch(`/materials/${materialId}/stock`, { quantity, action: 'add', reason, notes }),
  
  // Remove stock from a material
  removeStock: (materialId, quantity, reason = "", notes = "") =>
    API.patch(`/materials/${materialId}/stock`, { quantity, action: 'remove', reason, notes }),
  
  // Set exact stock amount for a material
  setStock: (materialId, quantity, reason = "", notes = "") =>
    API.patch(`/materials/${materialId}/stock`, { quantity, action: 'set', reason, notes }),
  
  // Update stock with custom action
  updateStock: (materialId, quantity, action, reason = "", notes = "") =>
    API.patch(`/materials/${materialId}/stock`, { quantity, action, reason, notes }),
  
  // Get transaction history for a material
  getTransactionHistory: (materialId, limit = 50, skip = 0) =>
    API.get(`/materials/${materialId}/transactions?limit=${limit}&skip=${skip}`),
  
  // Get recent activity across all materials
  getRecentActivity: (limit = 100, skip = 0) =>
    API.get(`/materials/transactions/recent?limit=${limit}&skip=${skip}`),
  
  // Get user activity history
  getUserActivity: (userId, limit = 50, skip = 0) =>
    API.get(`/materials/transactions/user/${userId}?limit=${limit}&skip=${skip}`)
};

export default API;
