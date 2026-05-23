import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"
import type { IDoctor, IReview } from "../types"
import useAuthStore from "../store/authStore"
import axios from "axios"

const DoctorDetail = () => {
  // useParams = URL se :id nikalta hai
  // /doctors/abc123 mein "abc123" milega
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  // States
  const [doctor, setDoctor] = useState<IDoctor | null>(null)
  const [reviews, setReviews] = useState<IReview[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Booking form states
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState("")
  const [reason, setReason] = useState("")

  // Page load pe doctor + reviews fetch karo
  useEffect(() => {
    const loadData = async () => {
      try {
        // Dono requests ek saath bhejo — time bachta hai
        // Promise.all = saari requests parallel chalti hain
        const [doctorRes, reviewsRes] = await Promise.all([
          api.get(`/api/doctors/${id}`),
          api.get(`/api/reviews/doctor/${id}`),
        ])
        setDoctor(doctorRes.data.data)
        setReviews(reviewsRes.data.data)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to load doctor")
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  // Date select hone pe available slots fetch karo
  const handleDateChange = async (date: string) => {
    setSelectedDate(date)
    setSelectedSlot("") // Pehla selected slot reset karo
    setSlotsLoading(true)

    try {
      const response = await api.get(`/api/schedules/slots/${id}`, {
        params: { date },
      })
      setAvailableSlots(response.data.data.availableSlots)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setAvailableSlots([])
        setError(err.response?.data?.message || "No slots available")
      }
    } finally {
      setSlotsLoading(false)
    }
  }

  // Appointment book karo
  const handleBooking = async () => {
    // Login check — agar nahi toh login pe bhejo
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    if (!selectedDate || !selectedSlot || !reason) {
      setError("Please select date, slot and enter reason")
      return
    }

    setBookingLoading(true)
    setError("")

    try {
      await api.post("/api/appointments", {
        doctorId: id,
        appointmentDate: selectedDate,
        slotTime: selectedSlot,
        reason,
      })

      setSuccess("Appointment booked successfully! 🎉")
      // Form reset karo
      setSelectedDate("")
      setSelectedSlot("")
      setReason("")
      setAvailableSlots([])
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Booking failed")
      }
    } finally {
      setBookingLoading(false)
    }
  }

  // Aaj ki date minimum date ke liye
  // Past mein appointment book nahi ho sakti
  const today = new Date().toISOString().split("T")[0]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Doctor not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Doctor Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold flex-shrink-0">
              {doctor.userId.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                {doctor.userId.name}
              </h1>
              <p className="text-blue-600 font-medium">{doctor.specialization}</p>

              <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-gray-600">
                <p>🏥 {doctor.hospital}</p>
                <p>⏱ {doctor.experience} years exp</p>
                <p>📞 {doctor.userId.phone}</p>
                <p>💰 PKR {doctor.consultationFee}</p>
              </div>

              {/* Qualifications */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {doctor.qualification.map((q, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-500">
                {doctor.averageRating.toFixed(1)}
              </p>
              <p className="text-yellow-400">⭐⭐⭐⭐⭐</p>
              <p className="text-xs text-gray-500">{doctor.totalReviews} reviews</p>
            </div>
          </div>

          {/* Bio */}
          {doctor.bio && (
            <p className="mt-4 text-gray-600 text-sm border-t pt-4">{doctor.bio}</p>
          )}
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Book Appointment
          </h2>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Date Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={today} // Past dates disable
                onChange={(e) => handleDateChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Slots */}
            {slotsLoading && (
              <p className="text-gray-500 text-sm">Loading slots...</p>
            )}

            {availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Slots
                </label>
                {/* Slots grid — click karo select karo */}
                <div className="flex flex-wrap gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                        ${selectedSlot === slot
                          ? "bg-blue-600 text-white border-blue-600"  // Selected
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400" // Normal
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms or reason..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Book Button */}
            <button
              onClick={handleBooking}
              disabled={bookingLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {bookingLoading
                ? "Booking..."
                : isAuthenticated
                ? "Book Appointment"
                : "Login to Book"}
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Patient Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-800">
                      {review.patientId.name}
                    </p>
                    {/* Rating stars */}
                    <p className="text-yellow-400">
                      {"⭐".repeat(review.rating)}
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default DoctorDetail