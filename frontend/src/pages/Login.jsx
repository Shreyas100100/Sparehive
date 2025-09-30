import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import API from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import SimpleNotification from "../components/SimpleNotification";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";


const schema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  
  // Check for signup success
  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      setShowSuccessMessage(true);
      // Remove the query param
      window.history.replaceState({}, '', '/login');
      // Hide message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid, touchedFields } 
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange"
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setServerError("");
      const res = await API.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      
      // Show login success notification
      setShowLoginSuccess(true);
      
      // Navigate to dashboard after showing notification
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setServerError(err.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthCard title="Welcome Back">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {serverError}
            </div>
          )}
          
          {showSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
              Account created successfully! Please sign in.
            </div>
          )}
        
        <div className="space-y-2">
          <div className="relative">
            <input 
              {...register("email")} 
              placeholder="Email address" 
              className={`w-full border-0 border-b-2 bg-transparent px-0 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 transition-colors duration-200 ${
                errors.email 
                  ? 'border-red-300 focus:border-red-500' 
                  : touchedFields.email && !errors.email
                  ? 'border-green-300 focus:border-green-500'
                  : 'border-gray-200 focus:border-green-500'
              }`}
            />
            {touchedFields.email && !errors.email && (
              <div className="absolute right-0 top-3 text-green-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <input 
              type="password" 
              {...register("password")} 
              placeholder="Password" 
              className={`w-full border-0 border-b-2 bg-transparent px-0 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 transition-colors duration-200 ${
                errors.password 
                  ? 'border-red-300 focus:border-red-500' 
                  : touchedFields.password && !errors.password
                  ? 'border-green-300 focus:border-green-500'
                  : 'border-gray-200 focus:border-green-500'
              }`}
            />
            {touchedFields.password && !errors.password && (
              <div className="absolute right-0 top-3 text-green-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs font-medium">{errors.password.message}</p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !isValid}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium tracking-wide transition-all duration-200 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-500 disabled:hover:to-emerald-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <Link 
            to="/signup" 
            className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </AuthCard>
    
    {showLoginSuccess && (
      <SimpleNotification 
        message="Welcome back! Redirecting to dashboard..."
        type="success"
        onClose={() => setShowLoginSuccess(false)}
      />
    )}
    </>
  );
}
