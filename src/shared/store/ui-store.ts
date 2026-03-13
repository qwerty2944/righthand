import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  searchModalOpen: boolean;
  toggleSidebar: () => void;
  openSearchModal: () => void;
  closeSearchModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  searchModalOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openSearchModal: () => set({ searchModalOpen: true }),
  closeSearchModal: () => set({ searchModalOpen: false }),
}));
