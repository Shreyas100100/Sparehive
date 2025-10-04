import { useState, useEffect } from "react";
import API from "../../services/api";
import CategoryForm from "./inventory/CategoryForm";
import MaterialForm from "./inventory/MaterialForm";

export default function AdminPanel({ activeView: propActiveView = 'overview' }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    managers: 0,
    admins: 0,
    pendingRequests: 0,
    totalMaterials: 0,
    lowStockCount: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);
  const [quickActions, setQuickActions] = useState([]);
  const [activeView, setActiveView] = useState(propActiveView);
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [roleRequests, setRoleRequests] = useState([]);
  const [error, setError] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);

  // Update activeView when prop changes
  useEffect(() => {
    setActiveView(propActiveView);
  }, [propActiveView]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersRes, materialsRes, lowStockRes, categoriesRes, requestsRes] = await Promise.all([
        API.get("/auth/users"),
        API.get("/materials"),
        API.get("/materials?lowStock=true"),
        API.get("/categories"),
        API.get("/auth/role-requests")
      ]);

      const users = usersRes.data;
      const pendingRequests = requestsRes.data.filter(req => req.roleRequest?.requestStatus === 'pending');
      
      // Store data for detailed views
      setUsers(users);
      setMaterials(materialsRes.data);
      setCategories(categoriesRes.data);
      setRoleRequests(requestsRes.data);
      
      setStats({
        totalUsers: users.length,
        managers: users.filter(user => user.role === "manager").length,
        admins: users.filter(user => user.role === "admin").length,
        pendingRequests: pendingRequests.length,
        totalMaterials: materialsRes.data.length,
        lowStockCount: lowStockRes.data.length,
        totalCategories: categoriesRes.data.length
      });

      // Set quick actions based on current state
      const actions = [];
      if (lowStockRes.data.length > 0) {
        actions.push({
          title: "Review Low Stock Items",
          description: `${lowStockRes.data.length} items need attention`,
          action: () => setActiveView('materials'),
          color: "red",
          urgent: true
        });
      }
      if (pendingRequests.length > 0) {
        actions.push({
          title: "Pending Role Requests",
          description: `${pendingRequests.length} requests waiting`,
          action: () => setActiveView('requests'),
          color: "yellow",
          urgent: true
        });
      }
      actions.push({
        title: "Add New Material",
        description: "Expand your inventory",
        action: () => setActiveView('materials'),
        color: "blue",
        urgent: false
      });
      actions.push({
        title: "Manage Users",
        description: "View and promote users",
        action: () => setActiveView('users'),
        color: "green",
        urgent: false
      });

      setQuickActions(actions);
      setError('');
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      await API.patch(`/auth/promote/${userId}`);
      await fetchDashboardData(); // Refresh data
    } catch (err) {
      setError('Failed to promote user. Please try again.');
      console.error(err);
    }
  };

  const handleRoleRequest = async (userId, action) => {
    try {
      await API.patch(`/auth/role-requests/${userId}`, { action });
      await fetchDashboardData(); // Refresh data
    } catch (err) {
      setError(`Failed to ${action} role request. Please try again.`);
      console.error(err);
    }
  };

  const handleCategorySubmit = async (categoryData) => {
    try {
      setShowCategoryForm(false);
      setEditingCategory(null);
      await fetchDashboardData(); // Refresh data
    } catch (err) {
      setError('Failed to save category. Please try again.');
      console.error(err);
    }
  };

  const handleMaterialSubmit = async (materialData) => {
    try {
      setShowMaterialForm(false);
      setEditingMaterial(null);
      await fetchDashboardData(); // Refresh data
    } catch (err) {
      setError('Failed to save material. Please try again.');
      console.error(err);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await API.delete(`/categories/${categoryId}`);
      await fetchDashboardData(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete category. Please try again.');
      console.error(err);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await API.delete(`/materials/${materialId}`);
      await fetchDashboardData(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete material. Please try again.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setError('');
            fetchDashboardData();
          }}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Component definitions
  const StatCard = ({ title, value, subtitle, color = "blue", trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {trend && (
          <div className={`p-3 rounded-full bg-${color}-50`}>
            <svg className={`w-6 h-6 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  const ActionCard = ({ title, description, action, color, urgent }) => (
    <button
      onClick={action}
      className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
        urgent 
          ? `border-${color}-200 bg-${color}-50 hover:bg-${color}-100` 
          : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`font-semibold mb-2 ${urgent ? `text-${color}-900` : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-sm ${urgent ? `text-${color}-700` : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
        <svg className={`w-5 h-5 mt-1 ${urgent ? `text-${color}-600` : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );

  // Render based on active view
  if (activeView === 'users') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          <button
            onClick={() => setActiveView('overview')}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Overview
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === "admin" ? "bg-purple-100 text-purple-800" :
                        user.role === "manager" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.role === "user" && (
                        <button
                          onClick={() => handlePromoteUser(user._id)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
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
        </div>
      </div>
    );
  }

  if (activeView === 'requests') {
    const pendingRequests = roleRequests.filter(req => req.roleRequest?.requestStatus === 'pending');
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Role Requests</h3>
          <button
            onClick={() => setActiveView('overview')}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Overview
          </button>
        </div>
        
        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
            <p className="text-gray-600">All role requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((user) => (
              <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-semibold text-gray-900">{user.name}</h4>
                      <span className="text-sm text-gray-500">{user.email}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700 font-medium mb-1">Justification:</p>
                      <p className="text-sm text-gray-600">{user.roleRequest.requestReason}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Requested on {new Date(user.roleRequest.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleRoleRequest(user._id, 'approve')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRoleRequest(user._id, 'reject')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeView === 'materials') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Materials Management</h3>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingMaterial(null);
                setShowMaterialForm(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Material
            </button>
            <button
              onClick={() => setActiveView('overview')}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Overview
            </button>
          </div>
        </div>
        
        {showMaterialForm && (
          <MaterialForm
            material={editingMaterial}
            categories={categories}
            onSubmit={handleMaterialSubmit}
            onCancel={() => {
              setShowMaterialForm(false);
              setEditingMaterial(null);
            }}
          />
        )}
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materials.map((material) => (
                  <tr key={material._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${material.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.currentStock} / {material.minimumStock} {material.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.location} {material.cupboard && `- ${material.cupboard}`} {material.shelf && `- ${material.shelf}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        material.currentStock <= material.minimumStock 
                          ? "bg-red-100 text-red-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {material.currentStock <= material.minimumStock ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setEditingMaterial(material);
                          setShowMaterialForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material._id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'categories') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Categories Management</h3>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryForm(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Category
            </button>
            <button
              onClick={() => setActiveView('overview')}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Overview
            </button>
          </div>
        </div>
        
        {showCategoryForm && (
          <CategoryForm
            category={editingCategory}
            onSubmit={handleCategorySubmit}
            onCancel={() => {
              setShowCategoryForm(false);
              setEditingCategory(null);
            }}
          />
        )}
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{category.description || 'No description'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setShowCategoryForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Default overview
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h2 className="text-2xl lg:text-3xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-blue-100 text-lg">Monitor and manage your organization</p>
      </div>

      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            subtitle={`${stats.managers} managers, ${stats.admins} admins`}
            color="blue"
            trend={true}
          />
          <StatCard 
            title="Materials" 
            value={stats.totalMaterials} 
            subtitle={`${stats.totalCategories} categories`}
            color="green"
            trend={true}
          />
          <StatCard 
            title="Low Stock Items" 
            value={stats.lowStockCount} 
            subtitle={stats.lowStockCount > 0 ? "Needs attention" : "All good"}
            color={stats.lowStockCount > 0 ? "red" : "green"}
          />
          <StatCard 
            title="Pending Requests" 
            value={stats.pendingRequests} 
            subtitle={stats.pendingRequests > 0 ? "Awaiting review" : "All clear"}
            color={stats.pendingRequests > 0 ? "yellow" : "green"}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <ActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Inventory System</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-green-600 font-medium">Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">User Management</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-green-600 font-medium">Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Last Backup</span>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}