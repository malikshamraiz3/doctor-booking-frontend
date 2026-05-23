import { create } from "zustand";
import type { IUser } from "../types";

// State ka type define karo
interface AuthState {
  user: IUser | null;        // Logged in user — null matlab logged out
  accessToken: string | null;
  isAuthenticated: boolean;  // true = logged in, false = logged out

  // Functions
  login: (user: IUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

// Zustand store banao
// create() ke andar state aur functions define hote hain
const useAuthStore = create<AuthState>((set) => ({
  // Initial state — page load pe localStorage se check karo
  // Taake refresh karne pe logout na ho
  user: JSON.parse(localStorage.getItem("user") || "null"),
  accessToken: localStorage.getItem("accessToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),
  // !! = string ko boolean mein convert karta hai

  // Login function — user data aur tokens save karo
  login: (user, accessToken, refreshToken) => {
    // LocalStorage mein save karo — page refresh pe bhi rahe
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    // Zustand state update karo — poori app ko pata chalega
    set({ user, accessToken, isAuthenticated: true });
  },

  // Logout function — sab clear karo
  logout: () => {
    localStorage.clear();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));

export default useAuthStore;