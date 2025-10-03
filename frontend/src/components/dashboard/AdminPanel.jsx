import { useState, useEffect } from "react";
import API from "../../services/api";
import RoleRequestsPanel from "./RoleRequestsPanel";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users"); // "users" or "requests"

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/users");
      setUsers(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load users. " + (err.response?.data?.msg || ""));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Panel</h2>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === "users"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`ml-8 py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === "requests"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Role Requests
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      {activeTab === "users" ? (
        <>
          {/* User stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Users</h3>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Managers</h3>
              <p className="text-2xl font-bold">
                {users.filter(user => user.role === "manager").length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Admins</h3>
              <p className="text-2xl font-bold">
                {users.filter(user => user.role === "admin").length}
              </p>
            </div>
          </div>
          
          {/* User management */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">User Management</h3>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg px-3 py-2 w-64"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-500">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === "admin" 
                              ? "bg-purple-100 text-purple-800" 
                              : user.role === "manager" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.role === "user" && (
                            <button
                              onClick={() => handlePromote(user._id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Promote to Manager
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <RoleRequestsPanel />
      )}
    </div>
  );
}