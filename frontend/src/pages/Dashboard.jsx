import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint =
          role === "admin" ? "/auth/admin" :
          role === "manager" ? "/auth/manager" :
          "/auth/user";
        const res = await API.get(endpoint);
        setMessage(res.data.msg);
      } catch {
        setMessage("Error fetching data");
      }
    };
    fetchData();
  }, [role]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-4">{message}</p>

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
