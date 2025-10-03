import { useState } from "react";
import RoleRequestForm from "./RoleRequestForm";
import API from "../../services/api";

export default function UserPanel({ userData }) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [refreshedUserData, setRefreshedUserData] = useState(userData);
  
  // Function to refresh user data after submitting a request
  const refreshUserData = async () => {
    try {
      const res = await API.get("/auth/me");
      setRefreshedUserData(res.data);
    } catch (err) {
      console.error("Failed to refresh user data", err);
    }
  };
  
  // Determine if user has any role request history
  const hasRoleRequestHistory = refreshedUserData?.roleRequest?.requested;
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Dashboard</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="mb-4">Welcome to your dashboard. Here you can view your activity and manage your account.</p>
        
        {!showRequestForm && !hasRoleRequestHistory ? (
          <button
            onClick={() => setShowRequestForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Request Manager Role
          </button>
        ) : (
          <RoleRequestForm 
            userData={refreshedUserData} 
            onRefresh={refreshUserData}
          />
        )}
      </div>
      
      {/* Other user content */}
    </div>
  );
}