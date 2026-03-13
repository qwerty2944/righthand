import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  searchModalOpen: boolean;
  quickPatientFormOpen: boolean;
  quickAppointmentFormOpen: boolean;
  toggleSidebar: () => void;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  openQuickPatientForm: () => void;
  closeQuickPatientForm: () => void;
  openQuickAppointmentForm: () => void;
  closeQuickAppointmentForm: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  searchModalOpen: false,
  quickPatientFormOpen: false,
  quickAppointmentFormOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openSearchModal: () => set({ searchModalOpen: true }),
  closeSearchModal: () => set({ searchModalOpen: false }),
  openQuickPatientForm: () => set({ quickPatientFormOpen: true }),
  closeQuickPatientForm: () => set({ quickPatientFormOpen: false }),
  openQuickAppointmentForm: () => set({ quickAppointmentFormOpen: true }),
  closeQuickAppointmentForm: () => set({ quickAppointmentFormOpen: false }),
}));
