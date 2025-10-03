import { useState, useEffect } from "react";
import API from "../../services/api";

export default function RoleRequestForm({ userData, onRefresh }) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Check if user has an existing request
  const hasActiveRequest = userData?.roleRequest?.requested && 
                          userData?.roleRequest?.requestStatus === "pending";
  
  const requestStatus = userData?.roleRequest?.requestStatus || "";
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await API.post("/auth/request-role", { reason });
      setMessage({ text: res.data.msg, type: "success" });
      setReason("");
      // Refresh user data to show updated status
      if (onRefresh) onRefresh();
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.msg || "Failed to submit request", 
        type: "error" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show different UI based on request status
  if (hasActiveRequest) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Manager Role Request</h2>
        
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="mr-3">
              <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div>
              <p className="font-medium">Your request is pending review</p>
              <p className="text-sm mt-1">We'll notify you when an admin reviews your request.</p>
              <p className="text-xs mt-2">Submitted on: {new Date(userData.roleRequest.requestDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (requestStatus === "approved") {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Manager Role Request</h2>
        
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="mr-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Your request was approved!</p>
              <p className="text-sm mt-1">You now have manager privileges.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (requestStatus === "rejected") {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Manager Role Request</h2>
        
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
          <div className="flex items-center">
            <div className="mr-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Your request was rejected</p>
              <p className="text-sm mt-1">You can submit a new request if needed.</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Submit New Request
        </button>
      </div>
    );
  }
  
  // Default form for new requests
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Request Manager Role</h2>
      
      {message.text && (
        <div className={`p-3 rounded-lg mb-4 ${
          message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Why do you need manager access?
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded-lg p-2 min-h-[100px]"
            placeholder="Please explain why you need manager privileges..."
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || reason.trim().length < 10}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}