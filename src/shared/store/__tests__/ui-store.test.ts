import { describe, it, expect, beforeEach } from "vitest";
import { useUiStore } from "../ui-store";

describe("useUiStore", () => {
  beforeEach(() => {
    useUiStore.setState({ sidebarOpen: true, searchModalOpen: false });
  });

  it("toggles sidebar", () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(true);
  });

  it("opens search modal", () => {
    useUiStore.getState().openSearchModal();
    expect(useUiStore.getState().searchModalOpen).toBe(true);
  });

  it("closes search modal", () => {
    useUiStore.getState().openSearchModal();
    useUiStore.getState().closeSearchModal();
    expect(useUiStore.getState().searchModalOpen).toBe(false);
  });
});
