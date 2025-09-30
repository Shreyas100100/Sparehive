// Signup.jsx
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { useState } from "react";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Min 6 characters").required("Password is required"),
  role: yup.string().oneOf(["user", "manager", "admin"]).required(),
  secret: yup.string().when("role", {
    is: "admin",
    then: (schema) => schema.required("Secret key is required for admin"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function Signup() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("user");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      await API.post("/auth/signup", data);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Error signing up");
    }
  };

  return (
    <AuthCard title="Sign Up">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("name")} placeholder="Name" className="w-full border p-2 rounded" />
        <p className="text-red-500 text-sm">{errors.name?.message}</p>

        <input {...register("email")} placeholder="Email" className="w-full border p-2 rounded" />
        <p className="text-red-500 text-sm">{errors.email?.message}</p>

        <input type="password" {...register("password")} placeholder="Password" className="w-full border p-2 rounded" />
        <p className="text-red-500 text-sm">{errors.password?.message}</p>

        <select
          {...register("role")}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="user">User</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <p className="text-red-500 text-sm">{errors.role?.message}</p>

        {selectedRole === "admin" && (
          <>
            <input {...register("secret")} placeholder="Admin Secret Key" className="w-full border p-2 rounded" />
            <p className="text-red-500 text-sm">{errors.secret?.message}</p>
          </>
        )}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Sign Up
        </button>
      </form>
    </AuthCard>
  );
}
