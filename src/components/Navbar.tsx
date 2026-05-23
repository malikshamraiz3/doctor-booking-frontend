import { Link, useNavigate } from "react-router-dom"
import useAuthStore from "../store/authStore"

const Navbar = () => {
  // useNavigate = programmatically kisi page pe jao
  const navigate = useNavigate()
  // Zustand store se user aur logout function lo
  const { isAuthenticated, user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()                 // Store clear karo
    navigate("/login")       // Login page pe bhejo
  }

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
      {/* Logo */}
      <Link to="/doctors" className="text-xl font-bold">
        🏥 Doctor Booking
      </Link>

      {/* Links */}
      <div className="flex items-center gap-6">
        <Link to="/doctors" className="hover:text-blue-200">
          Doctors
        </Link>

        {/* Sirf logged in user ko dikhao */}
        {isAuthenticated && (
          <Link to="/my-appointments" className="hover:text-blue-200">
            My Appointments
          </Link>
        )}

        {/* Sirf admin ko dikhao */}
        {isAuthenticated && user?.role === "admin" && (
          <Link to="/admin" className="hover:text-blue-200">
            Admin
          </Link>
        )}

        {/* Login/Logout button */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {/* User ka naam dikhao */}
            <span className="text-blue-200 text-sm">
              Hi, {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-semibold hover:bg-blue-50"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link
              to="/login"
              className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-semibold hover:bg-blue-50"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="border border-white px-4 py-1 rounded-full text-sm hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar