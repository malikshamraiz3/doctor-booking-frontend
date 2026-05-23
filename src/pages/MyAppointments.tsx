import { useState, useEffect } from "react";
import api from "../services/api";
import type { IAppointment } from "../types";
import axios from "axios";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  // cancellingId = konsi appointment cancel ho rahi hai — us ka loader dikhane ke liye

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await api.get("/api/appointments/my");
        console.log("Response:", response.data); // ← Yeh add karo
        setAppointments(response.data.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.log("Error:", err.response);
          setError(
            err.response?.data?.message || "Failed to load appointments",
          );
        }
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, []);

  // Appointment cancel karo
  const handleCancel = async (appointmentId: string) => {
    // Confirm dialog — accidental cancel rokne ke liye
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setCancellingId(appointmentId); // Us appointment ka loader on karo

    try {
      await api.patch(`/api/appointments/${appointmentId}/cancel`, {
        cancelReason: "Cancelled by patient",
      });

      // API call ke baad state update karo — page reload ki zaroorat nahi
      // map = har appointment check karo, jo cancel hui uski status update karo
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === appointmentId ? { ...apt, status: "cancelled" } : apt,
        ),
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to cancel");
      }
    } finally {
      setCancellingId(null);
    }
  };

  // Status ke hisaab se badge color
  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      "no-show": "bg-gray-100 text-gray-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  // Date format karo — "2024-12-25" → "Dec 25, 2024"
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          My Appointments
        </h1>
        <p className="text-gray-500 mb-6">Track and manage your appointments</p>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Empty State */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-gray-600 font-medium">No appointments yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Book an appointment with a doctor to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                {/* Top Row — Doctor name + Status badge */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {appointment.doctorId?.userId?.name}
                    </h3>
                    <p className="text-blue-600 text-sm">
                      {appointment.doctorId?.specialization}
                    </p>
                    <p className="text-gray-500 text-sm">
                      🏥 {appointment.doctorId?.hospital}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(appointment.status)}`}
                  >
                    {appointment.status}
                  </span>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                  <p>📅 {formatDate(appointment.appointmentDate)}</p>
                  <p>🕐 {appointment.slotTime}</p>
                  <p>💰 PKR {appointment.fee}</p>
                  <p>📋 {appointment.reason}</p>
                </div>

                {/* Cancel Reason — agar cancel hua ho */}
                {appointment.cancelReason && (
                  <p className="text-red-500 text-xs mb-3">
                    Cancel reason: {appointment.cancelReason}
                  </p>
                )}

                {/* Cancel Button — sirf pending ya confirmed pe dikhao */}
                {["pending", "confirmed"].includes(appointment.status) && (
                  <button
                    onClick={() => handleCancel(appointment._id)}
                    disabled={cancellingId === appointment._id}
                    className="text-red-500 border border-red-300 px-4 py-1 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancellingId === appointment._id
                      ? "Cancelling..."
                      : "Cancel Appointment"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
