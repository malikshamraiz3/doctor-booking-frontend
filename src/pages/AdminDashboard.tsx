import { useState, useEffect } from "react"
import api from "../services/api"
import type { IAppointment } from "../types"
import axios from "axios"

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true) // Filter change pe bhi loading dikhao
      try {
        const response = await api.get("/api/appointments", {
          params: statusFilter ? { status: statusFilter } : {},
        })
        setAppointments(response.data.data)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to load")
        }
      } finally {
        setLoading(false)
      }
    }
    loadAppointments()
  }, [statusFilter])

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    setUpdatingId(appointmentId)
    try {
      await api.patch(`/api/appointments/${appointmentId}/status`, {
        status: newStatus,
      })
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === appointmentId
            ? { ...apt, status: newStatus as IAppointment["status"] }
            : apt
        )
      )
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Update failed")
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      pending:   "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      "no-show": "bg-gray-100 text-gray-700",
    }
    return styles[status] || "bg-gray-100 text-gray-700"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mb-6">Manage all appointments</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-gray-800">
              {appointments.length}
            </p>
            <p className="text-gray-500 text-sm">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {appointments.filter((a) => a.status === "pending").length}
            </p>
            <p className="text-yellow-600 text-sm">Pending</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-blue-600">
              {appointments.filter((a) => a.status === "confirmed").length}
            </p>
            <p className="text-blue-600 text-sm">Confirmed</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-green-600">
              {appointments.filter((a) => a.status === "completed").length}
            </p>
            <p className="text-green-600 text-sm">Completed</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex gap-3 flex-wrap items-center">
          {["", "pending", "confirmed", "completed", "cancelled", "no-show"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition
                  ${statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {status === "" ? "All" : status}
              </button>
            )
          )}

          {/* Filter change pe loading spinner */}
          {loading && (
            <div className="flex items-center gap-2 text-blue-600 text-sm ml-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Appointments */}
        {!loading && appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white rounded-2xl shadow-sm p-6 relative"
              >
                {/* Loading Overlay — update hote waqt */}
                {updatingId === appointment._id && (
                  <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 text-blue-600 font-medium">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-start justify-between gap-4">

                  {/* Left — Patient + Doctor Info */}
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800">
                      👤 {appointment.patientId?.name || "N/A"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {appointment.patientId?.email}
                    </p>
                    <p className="text-blue-600 text-sm font-medium mt-2">
                      🩺 {appointment.doctorId?.userId?.name || "N/A"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {appointment.doctorId?.specialization}
                    </p>
                  </div>

                  {/* Middle — Appointment Details */}
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📅 {formatDate(appointment.appointmentDate)}</p>
                    <p>🕐 {appointment.slotTime}</p>
                    <p>💰 PKR {appointment.fee}</p>
                    <p>📋 {appointment.reason}</p>
                  </div>

                  {/* Right — Status + Action Buttons */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(appointment.status)}`}>
                      {appointment.status}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap justify-end">

                      {/* Pending → Confirm */}
                      {appointment.status === "pending" && (
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, "confirmed")}
                          disabled={updatingId === appointment._id}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50"
                        >
                          {updatingId === appointment._id ? "Updating..." : "Confirm"}
                        </button>
                      )}

                      {/* Confirmed → Complete ya No Show */}
                      {appointment.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, "completed")}
                            disabled={updatingId === appointment._id}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700 disabled:opacity-50"
                          >
                            {updatingId === appointment._id ? "Updating..." : "Complete"}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, "no-show")}
                            disabled={updatingId === appointment._id}
                            className="bg-gray-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-gray-600 disabled:opacity-50"
                          >
                            {updatingId === appointment._id ? "Updating..." : "No Show"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard