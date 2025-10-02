import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar"
import AdminPanel from "../components/dashboard/AdminPanel";
import ManagerPanel from "../components/dashboard/ManagerPanel";
import UserPanel from "../components/dashboard/UserPanel";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await API.get("/auth/me");
        setUserData(res.data);
        // Update role in localStorage in case it changed
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);
        setError("");
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Error fetching user data. Please try logging in again.");
        if (err.response && err.response.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchData();
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleLogout}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar role={userData?.role || role} />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {userData?.name}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
        
        {/* Role-specific Panel */}
        {userData?.role === "admin" && <AdminPanel />}
        {userData?.role === "manager" && <ManagerPanel />}
        {userData?.role === "user" && <UserPanel />}
      </div>
    </div>
  );
}