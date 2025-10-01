import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

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
        setError("");
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Error fetching user data. Please try logging in again.");
        // Redirect to login if the token is invalid
        if (err.response && err.response.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4"> {userData?.role || role} Dashboard</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="mb-4">
            <p className="font-bold">Welcome, {userData?.name || name} !</p>
            {/* <p className="text-gray-600">Email: {userData?.email}</p>
            <p className="text-gray-600">Role: {userData?.role || role}</p> */}
          </div>
        )}

        {/* Role-based tabs */}
        <div className="space-y-2 mb-4">
          {(role === "user" || role === "manager" || role === "admin") && (
            <div className="p-2 bg-gray-100 rounded">User Section</div>
          )}
          {(role === "manager" || role === "admin") && (
            <div className="p-2 bg-gray-100 rounded">Manager Section</div>
          )}
          {role === "admin" && (
            <div className="p-2 bg-gray-100 rounded">Admin Section</div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}