import { useState, useEffect } from "react";
import API from "../../services/api";

export default function UserPanel({ userData }) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [refreshedUserData, setRefreshedUserData] = useState(userData);
  const [requestStatus, setRequestStatus] = useState('');
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Function to refresh user data after submitting a request
  const refreshUserData = async () => {
    try {
      const res = await API.get("/auth/me");
      setRefreshedUserData(res.data);
    } catch (err) {
      console.error("Failed to refresh user data", err);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);
  
  // Determine if user has any role request history
  const hasRoleRequestHistory = refreshedUserData?.roleRequest?.requested;
  const requestPending = refreshedUserData?.roleRequest?.requestStatus === 'pending';
  const requestApproved = refreshedUserData?.roleRequest?.requestStatus === 'approved';
  const requestRejected = refreshedUserData?.roleRequest?.requestStatus === 'rejected';

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await API.post("/auth/request-role", {
        reason: justification
      });
      
      setRequestStatus('success');
      await refreshUserData();
      setShowRequestForm(false);
    } catch (err) {
      setRequestStatus('error');
      console.error("Failed to submit role request", err);
    } finally {
      setSubmitting(false);
    }
  };

  const StatusCard = ({ title, description, type, action, actionText }) => {
    const colors = {
      info: "bg-blue-50 border-blue-200 text-blue-800",
      success: "bg-green-50 border-green-200 text-green-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      error: "bg-red-50 border-red-200 text-red-800"
    };

    const icons = {
      info: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      success: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      warning: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      error: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };

    return (
      <div className={`p-6 rounded-xl border-2 ${colors[type]}`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="mb-4 opacity-90">{description}</p>
            {action && (
              <button
                onClick={action}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                {actionText}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const RequestForm = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Manager Role</h3>
      <form onSubmit={handleRequestSubmit} className="space-y-4">
        <div>
          <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-2">
            Why do you want to become a manager?
          </label>
          <textarea
            id="justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Explain your experience, qualifications, and reasons for wanting manager access..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="4"
            required
          />
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || !justification.trim()}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Request'
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowRequestForm(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
        <h2 className="text-2xl lg:text-3xl font-bold mb-2">Welcome, {refreshedUserData?.name}</h2>
        <p className="text-purple-100 text-lg">Your personal workspace</p>
      </div>

      {/* Account Status */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Account Type</h4>
                <p className="text-sm text-gray-600">Your current role</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium capitalize">
                {refreshedUserData?.role}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Active
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Member Since</h4>
                <p className="text-sm text-gray-600">Join date</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(refreshedUserData?.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Role Request Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Upgrade</h3>
        
        {requestStatus === 'success' && (
          <StatusCard
            title="Request Submitted Successfully!"
            description="Your manager role request has been submitted and is being reviewed by administrators."
            type="success"
          />
        )}
        
        {requestStatus === 'error' && (
          <StatusCard
            title="Request Failed"
            description="There was an error submitting your request. Please try again later."
            type="error"
            action={() => setRequestStatus('')}
            actionText="Try Again"
          />
        )}
        
        {!hasRoleRequestHistory && !showRequestForm && requestStatus !== 'success' && (
          <StatusCard
            title="Want More Access?"
            description="Request manager privileges to gain access to inventory management features and help organize your team's resources."
            type="info"
            action={() => setShowRequestForm(true)}
            actionText="Request Manager Role"
          />
        )}
        
        {requestPending && (
          <StatusCard
            title="Request Under Review"
            description={`Your manager role request is being reviewed by administrators. You'll be notified once a decision is made.`}
            type="warning"
          />
        )}
        
        {requestApproved && (
          <StatusCard
            title="Request Approved!"
            description="Congratulations! Your manager role request has been approved. Please log out and log back in to access your new features."
            type="success"
          />
        )}
        
        {requestRejected && (
          <StatusCard
            title="Request Not Approved"
            description="Your manager role request was not approved at this time. You may submit a new request in the future."
            type="error"
            action={() => {
              setShowRequestForm(true);
              setJustification('');
            }}
            actionText="Submit New Request"
          />
        )}
        
        {showRequestForm && <RequestForm />}
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Getting Started</h4>
              <p className="text-sm text-gray-600">Learn how to use the platform and request additional access</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Contact Support</h4>
              <p className="text-sm text-gray-600">Reach out to administrators for assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}