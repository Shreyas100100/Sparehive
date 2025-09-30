import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import SelectField from "../components/SelectField";
import SimpleNotification from "../components/SimpleNotification";
import { useState } from "react";
import { Link } from "react-router-dom";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  role: yup.string().oneOf(["user", "manager", "admin"]).required("Please select a role"),
  secret: yup.string().when("role", {
    is: "admin",
    then: (schema) => schema.required("Admin secret key is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function Signup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isValid, touchedFields } 
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      role: "user" // Set default role to user
    }
  });

  const selectedRole = watch("role", "user");

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setServerError("");
      await API.post("/auth/signup", data);
      
      // Show success notification
      setShowSuccessNotification(true);
      
      // Navigate to login after showing notification
      setTimeout(() => {
        navigate("/login?signup=success");
      }, 2000);
    } catch (err) {
      setServerError(err.response?.data?.msg || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthCard title="Create Account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {serverError}
          </div>
        )}

        <InputField
          register={register}
          name="name"
          placeholder="Full name"
          error={errors.name?.message}
          touched={touchedFields.name}
        />

        <InputField
          register={register}
          name="email"
          type="email"
          placeholder="Email address"
          error={errors.email?.message}
          touched={touchedFields.email}
        />

        <InputField
          register={register}
          name="password"
          type="password"
          placeholder="Password"
          error={errors.password?.message}
          touched={touchedFields.password}
        />

        <SelectField
          register={register}
          name="role"
          options={[
            { value: "user", label: "User" },
            { value: "manager", label: "Manager" },
            { value: "admin", label: "Admin" }
          ]}
          error={errors.role?.message}
          touched={touchedFields.role}
        />

        {selectedRole === "admin" && (
          <InputField
            register={register}
            name="secret"
            type="password"
            placeholder="Admin secret key"
            error={errors.secret?.message}
            touched={touchedFields.secret}
          />
        )}

        <button 
          type="submit" 
          disabled={isLoading || !isValid}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium tracking-wide transition-all duration-200 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-500 disabled:hover:to-emerald-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating account...</span>
            </div>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link 
            to="/login" 
            className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthCard>
    
    {showSuccessNotification && (
      <SimpleNotification 
        message="Account created successfully! Redirecting to login..."
        type="success"
        onClose={() => setShowSuccessNotification(false)}
      />
    )}
    </>
  );
}
