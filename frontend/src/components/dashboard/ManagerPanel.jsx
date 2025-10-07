import { useState, useEffect } from "react";
import API from "../../services/api";

export default function ManagerPanel({ userData, onNavigate }) {
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalCategories: 0,
    lowStockCount: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [quickActions, setQuickActions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [materialsRes, lowStockRes, categoriesRes] = await Promise.all([
        API.get("/materials"),
        API.get("/materials?lowStock=true"),
        API.get("/categories")
      ]);

      setStats({
        totalMaterials: materialsRes.data.length,
        lowStockCount: lowStockRes.data.length,
        totalCategories: categoriesRes.data.length,
        recentActivities: [] // Add activity tracking later
      });

      // Set quick actions based on current state
      const actions = [];
      if (lowStockRes.data.length > 0) {
        actions.push({
          title: "Check Low Stock",
          description: `${lowStockRes.data.length} items running low`,
          action: () => {
            if (onNavigate) {
              onNavigate('materials');
            }
          },
          color: "red",
          urgent: true,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        });
      }
      
      actions.push(
        {
          title: "Add Material",
          description: "Add new items to inventory",
          action: () => {
            if (onNavigate) {
              onNavigate('materials');
            }
          },
          color: "blue",
          urgent: false,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )
        },
        {
          title: "Manage Categories",
          description: "Organize your inventory",
          action: () => {
            if (onNavigate) {
              onNavigate('categories');
            }
          },
          color: "green",
          urgent: false,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          )
        },
        {
          title: "View Activity",
          description: "Recent inventory changes",
          action: () => {
            if (onNavigate) {
              onNavigate('activity');
            }
          },
          color: "purple",
          urgent: false,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        }
      );

      setQuickActions(actions);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, color = "blue", alert = false }) => (
    <div className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md p-6 ${
      alert ? 'border-red-200 bg-red-50' : 'border-gray-100'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium mb-1 ${alert ? 'text-red-600' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold ${alert ? 'text-red-700' : `text-${color}-600`}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-sm mt-1 ${alert ? 'text-red-600' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {alert && (
          <div className="p-3 rounded-full bg-red-100">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  const ActionCard = ({ title, description, action, color, urgent, icon }) => (
    <button
      onClick={action}
      className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
        urgent 
          ? `border-${color}-200 bg-${color}-50 hover:bg-${color}-100` 
          : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`p-2 rounded-lg ${urgent ? `bg-${color}-100` : 'bg-gray-100'}`}>
            <span className={`${urgent ? `text-${color}-600` : 'text-gray-600'}`}>
              {icon}
            </span>
          </div>
          <div>
            <h3 className={`font-semibold mb-1 ${urgent ? `text-${color}-900` : 'text-gray-900'}`}>
              {title}
            </h3>
            <p className={`text-sm ${urgent ? `text-${color}-700` : 'text-gray-600'}`}>
              {description}
            </p>
          </div>
        </div>
        <svg className={`w-5 h-5 mt-2 ${urgent ? `text-${color}-600` : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
        <h2 className="text-2xl lg:text-3xl font-bold mb-2">Manager Dashboard</h2>
        <p className="text-green-100 text-lg">Oversee your inventory operations</p>
      </div>

      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Materials" 
            value={stats.totalMaterials} 
            subtitle={`Across ${stats.totalCategories} categories`}
            color="blue"
          />
          <StatCard 
            title="Categories" 
            value={stats.totalCategories} 
            subtitle="Active categories"
            color="green"
          />
          <StatCard 
            title="Low Stock Items" 
            value={stats.lowStockCount} 
            subtitle={stats.lowStockCount > 0 ? "Requires attention" : "All items stocked"}
            color="red"
            alert={stats.lowStockCount > 0}
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

      {/* Inventory Health */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Health</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Overall Stock Level</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                <div 
                  className={`h-2 rounded-full ${stats.lowStockCount === 0 ? 'bg-green-500' : stats.lowStockCount < 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.max(10, 100 - (stats.lowStockCount / stats.totalMaterials * 100))}%` }}
                ></div>
              </div>
              <span className={`text-sm font-medium ${stats.lowStockCount === 0 ? 'text-green-600' : stats.lowStockCount < 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                {stats.lowStockCount === 0 ? 'Excellent' : stats.lowStockCount < 5 ? 'Good' : 'Needs Attention'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Category Coverage</span>
            <span className="text-sm text-gray-500">{stats.totalCategories} active</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Last Updated</span>
            <span className="text-sm text-gray-500">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}