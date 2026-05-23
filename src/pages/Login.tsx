import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuthStore from "../store/authStore";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // useState = component ki local state
  // formData = input fields ki values
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); // Error message
  const [loading, setLoading] = useState(false); // Button disabled during API call

  // Input change hone pe formData update karo
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // ...formData = purani values copy karo
    // [e.target.name] = jo field change hui us ki value update karo
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Page reload rokta hai form submit pe
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", formData);
      const { user, accessToken, refreshToken } = response.data.data;

      // Zustand store mein save karo — poori app ko pata chalega
      login(user, accessToken, refreshToken);

      // Role ke hisaab se redirect
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/doctors");
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any).response?.data?.message || "Login failed");
    } finally {
      setLoading(false); // Chahe success ho ya error — loading band karo
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-gray-500 mb-6">Login to your account</p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email" // handleChange mein [e.target.name] yeh use karta hai
              value={formData.email}
              onChange={handleChange}
              placeholder="ali@gmail.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {/* Loading state pe text change karo */}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
