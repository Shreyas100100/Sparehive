import { useState, useEffect } from "react";
import API from "../../services/api";

export default function RoleRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  useEffect(() => {
    fetchRequests();
  }, []);
  
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/role-requests");
      setRequests(res.data);
    } catch (err) {
      setMessage({
        text: "Failed to load role requests",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAction = async (userId, action) => {
    try {
      await API.patch(`/auth/role-requests/${userId}`, { action });
      // Remove the request from the list
      setRequests(requests.filter(req => req._id !== userId));
      setMessage({
        text: `Request ${action === "approve" ? "approved" : "rejected"} successfully`,
        type: "success"
      });
    } catch (err) {
      setMessage({
        text: err.response?.data?.msg || `Failed to ${action} request`,
        type: "error"
      });
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Pending Role Requests</h2>
      
      {message.text && (
        <div className={`p-3 rounded-lg mb-4 ${
          message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
        }`}>
          {message.text}
        </div>
      )}
      
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending requests</p>
      ) : (
        <div className="space-y-4">
          {requests.map(user => (
            <div key={user._id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  <p className="text-gray-500 text-xs">
                    Requested: {new Date(user.roleRequest.requestDate).toLocaleDateString()}
                  </p>
                  <div className="mt-2 bg-gray-50 p-3 rounded text-sm">
                    <strong>Reason:</strong> {user.roleRequest.requestReason}
                  </div>
                </div>
                
                <div className="space-x-2">
                  <button
                    onClick={() => handleAction(user._id, "approve")}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(user._id, "reject")}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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