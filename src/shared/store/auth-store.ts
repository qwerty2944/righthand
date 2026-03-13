import { create } from "zustand";

interface User {
  id: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  clinicId: string | null;
  setUser: (user: User | null) => void;
  setClinicId: (clinicId: string | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  clinicId: null,
  setUser: (user) => set({ user }),
  setClinicId: (clinicId) => set({ clinicId }),
  clearUser: () => set({ user: null, clinicId: null }),
}));
