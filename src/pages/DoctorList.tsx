import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import type { IDoctor } from "../types"
import axios from "axios"

const DoctorList = () => {
  const navigate = useNavigate()

  const [doctors, setDoctors] = useState<IDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [maxFee, setMaxFee] = useState("")

  // ✅ useEffect ke andar async function define karo
  // Page load pe ek baar doctors fetch karo
  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true)
      try {
        const response = await api.get("/api/doctors")
        setDoctors(response.data.data)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to fetch doctors")
        }
      } finally {
        setLoading(false)
      }
    }
    loadDoctors()
  }, [])

  // Filter button click pe yeh chalta hai — useEffect se alag
  const fetchDoctors = async (filters = {}) => {
    setLoading(true)
    try {
      const response = await api.get("/api/doctors", { params: filters })
      setDoctors(response.data.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch doctors")
      }
    } finally {
      setLoading(false)
    }
  }

  // Filter apply karo
  const handleFilter = () => {
    const filters: Record<string, string> = {}
    if (specialization) filters.specialization = specialization
    if (maxFee) filters.maxFee = maxFee
    fetchDoctors(filters)
  }

  // Filter reset karo
  const handleReset = () => {
    setSpecialization("")
    setMaxFee("")
    fetchDoctors()
  }

  // Rating stars dikhao
  const renderStars = (rating: number) => {
    return "⭐".repeat(Math.round(rating)) || "No reviews yet"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading doctors...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Find a Doctor</h1>
        <p className="text-gray-500 mb-6">Book appointments with top specialists</p>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Cardiologist"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Fee (PKR)
            </label>
            <input
              type="number"
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
              placeholder="e.g. 2000"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 font-medium"
          >
            Reset
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Doctors Grid */}
        {doctors.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No doctors found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition"
              >
                {/* Doctor Avatar + Name */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
                    {doctor.userId.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {doctor.userId.name}
                    </h3>
                    <p className="text-blue-600 text-sm">
                      {doctor.specialization}
                    </p>
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>🏥 {doctor.hospital}</p>
                  <p>⏱ {doctor.experience} years experience</p>
                  <p>💰 PKR {doctor.consultationFee}</p>
                  <p>
                    {renderStars(doctor.averageRating)}{" "}
                    ({doctor.totalReviews} reviews)
                  </p>
                </div>

                {/* Book Button */}
                <button
                  onClick={() => navigate(`/doctors/${doctor._id}`)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  View & Book
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorList