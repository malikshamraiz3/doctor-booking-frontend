// User ka type
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "patient" | "admin";
}

// Doctor ka type
export interface IDoctor {
  _id: string;
  userId: {
    name: string;
    email: string;
    phone: string;
  };
  specialization: string;
  qualification: string[];
  experience: number;
  consultationFee: number;
  hospital: string;
  bio: string;
  averageRating: number;
  totalReviews: number;
  isAvailable: boolean;
}

// Appointment ka type
export interface IAppointment {
  _id: string;
  patientId: IUser;
  doctorId: {
    // Populated object aata hai
    _id: string;
    userId: {
      name: string;
      email: string;
      phone: string;
    };
    specialization: string;
    hospital: string;
    consultationFee: number;
  };
  appointmentDate: string;
  slotTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
  reason: string;
  fee: number;
  cancelReason?: string;
}

// Prescription ka type
export interface IPrescription {
  _id: string;
  appointmentId: string;
  doctorId: IDoctor;
  patientId: IUser;
  diagnosis: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  followUpDate?: string;
}

// Review ka type
export interface IReview {
  _id: string;
  doctorId: string;
  patientId: IUser;
  rating: number;
  comment: string;
  createdAt: string;
}

// API Response ka type — backend se jo format aata hai
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
