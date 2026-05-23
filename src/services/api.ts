import axios from "axios";

// Axios instance — base URL ek baar set karo
// Ab har jagah sirf /api/auth/login likhna hoga
// http://localhost:5000 automatically lagega
const api = axios.create({
  baseURL:  "https://doctor-booking-api-zeta.vercel.app/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
// Kaam: Har request jaane se pehle token attach karo
// Jaise envelope pe stamp lagana — automatically
api.interceptors.request.use((config) => {
  // LocalStorage se token uthao
  const token = localStorage.getItem("accessToken");
  if (token) {
    // Authorization header mein lagao
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
// Kaam: Agar 401 error aaye (token expire) toh
// automatically naya token lo aur request dobara bhejo
api.interceptors.response.use(
  (response) => response, // Success — waise hi return karo

  async (error) => {
    const originalRequest = error.config;

    // 401 = token expire, _retry = infinity loop rokne ke liye
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        // Naya access token lo
        const response = await axios.post(
         // "http://localhost:5000/api/auth/refresh-token",
         "https://doctor-booking-api-zeta.vercel.app/",
          { refreshToken }
        );

        const newToken = response.data.data.accessToken;
        // Naya token save karo
        localStorage.setItem("accessToken", newToken);

        // Purani request dobara bhejo naye token ke saath
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        // Refresh token bhi expire — logout karo
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;