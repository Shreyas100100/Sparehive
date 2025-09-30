import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { Link } from "react-router-dom";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      const res = await API.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Error logging in");
    }
  };

  return (
    <AuthCard title="Login">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("email")} placeholder="Email" className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500" />
        <p className="text-red-500 text-sm">{errors.email?.message}</p>

        <input type="password" {...register("password")} placeholder="Password" className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500" />
        <p className="text-red-500 text-sm">{errors.password?.message}</p>

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Login
        </button>
      </form>
       <p className="text-sm text-center mt-4 text-gray-600">
      Don’t have an account?{" "}
      <Link to="/" className="text-blue-600 hover:underline">
        Sign Up
      </Link>
    </p>
    </AuthCard>
  );
}
