import { Link } from "react-router-dom";
import Logo from "../Logo";

export default function Sidebar({ role }) {
  return (
    <div className="bg-white shadow-md w-64 min-h-screen p-4">
      <div className="mb-8">
        <Logo variant="full" size="md" />
      </div>
      
      <nav className="space-y-1">
        <Link to="/dashboard" className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
          Dashboard
        </Link>
        
        <Link to="/dashboard/profile" className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
          My Profile
        </Link>
        
        {(role === "admin" || role === "manager") && (
          <Link to="/dashboard/team" className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            Team Management
          </Link>
        )}
        
        {role === "admin" && (
          <Link to="/dashboard/users" className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            User Management
          </Link>
        )}
      </nav>
    </div>
  );
}