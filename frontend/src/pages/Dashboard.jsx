import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar"
import AdminPanel from "../components/dashboard/AdminPanel";
import ManagerPanel from "../components/dashboard/ManagerPanel";
import UserPanel from "../components/dashboard/UserPanel";
import InventoryManager from "../components/dashboard/inventory/InventoryManager";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState('overview');
  
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

  // In the return statement of Dashboard.jsx
return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    {/* Sidebar */}
    <Sidebar 
      role={userData?.role || role} 
      onSectionChange={setActiveSection}
    />
    
    {/* Main Content */}
    <div className="lg:ml-64">
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {userData?.name}
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              {userData?.role === 'admin' ? 'Manage your organization' : 
               userData?.role === 'manager' ? 'Oversee inventory operations' : 
               'Access your workspace'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border">
              <div className={`w-2 h-2 rounded-full mr-2 ${userData ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className="text-sm text-gray-600 capitalize">{userData?.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        
        {/* Role-specific Panel */}
        {activeSection === 'overview' && (
          <>
            {userData?.role === "admin" && <AdminPanel />}
            {userData?.role === "manager" && <ManagerPanel userData={userData} />}
            {userData?.role === "user" && <UserPanel userData={userData} />}
          </>
        )}
        
        {/* Section-specific content for Admin */}
        {userData?.role === "admin" && (
          <>
            {activeSection === 'users' && <AdminPanel activeView="users" />}
            {activeSection === 'requests' && <AdminPanel activeView="requests" />}
            {activeSection === 'materials' && <InventoryManager activeView="materials" userRole={userData?.role} />}
            {activeSection === 'categories' && <InventoryManager activeView="categories" userRole={userData?.role} />}
          </>
        )}
        
        {/* Section-specific content for Manager */}
        {userData?.role === "manager" && (
          <>
            {activeSection === 'materials' && <InventoryManager activeView="materials" userRole={userData?.role} />}
            {activeSection === 'categories' && <InventoryManager activeView="categories" userRole={userData?.role} />}
          </>
        )}
      </div>
    </div>
  </div>
);
}