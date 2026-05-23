import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import useAuthStore from "./store/authStore"

// Pages — abhi banayenge
import Login from "./pages/Login"
import Register from "./pages/Register"
import DoctorList from "./pages/DoctorList"
import DoctorDetail from "./pages/DoctorDetail"
import MyAppointments from "./pages/MyAppointments"
import AdminDashboard from "./pages/AdminDashboard"
import Navbar from "./components/Navbar"

// ─── PROTECTED ROUTE ─────────────────────────────────────
// Kaam: Agar logged in nahi toh login page pe bhejo
// Jaise building ka security guard — bina ID ke andar nahi
interface ProtectedRouteProps {
  children: React.ReactNode        // Andar wala page
  adminOnly?: boolean              // Sirf admin ke liye?
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore()

  // Logged in nahi — login pe bhejo
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Admin page hai but user admin nahi
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/doctors" replace />
  }

  return <>{children}</>
}

// ─── APP ─────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        {/* Public Routes — koi bhi dekh sakta hai */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/doctors/:id" element={<DoctorDetail />} />

        {/* Protected Routes — sirf logged in user */}
        <Route path="/my-appointments" element={
          <ProtectedRoute>
            <MyAppointments />
          </ProtectedRoute>
        } />

        {/* Admin Only Route */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Default — seedha doctors page pe jao */}
        <Route path="/" element={<Navigate to="/doctors" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App