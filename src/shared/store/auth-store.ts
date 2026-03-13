import { create } from "zustand";
import { createClient } from "@/shared/lib/supabase/client";

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
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  clinicId: null,
  setUser: (user) => set({ user }),
  setClinicId: (clinicId) => set({ clinicId }),
  clearUser: () => set({ user: null, clinicId: null }),
  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    get().clearUser();
    window.location.href = "/login";
  },
}));
