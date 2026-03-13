import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../auth-store";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, clinicId: null });
  });

  it("initializes with null user", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.clinicId).toBeNull();
  });

  it("sets user correctly", () => {
    const mockUser = {
      id: "user-1",
      email: "test@test.com",
    };

    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
  });

  it("sets clinic ID correctly", () => {
    useAuthStore.getState().setClinicId("clinic-1");
    const state = useAuthStore.getState();
    expect(state.clinicId).toBe("clinic-1");
  });

  it("clears user correctly", () => {
    const mockUser = {
      id: "user-1",
      email: "test@test.com",
    };

    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setClinicId("clinic-1");
    useAuthStore.getState().clearUser();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.clinicId).toBeNull();
  });
});
