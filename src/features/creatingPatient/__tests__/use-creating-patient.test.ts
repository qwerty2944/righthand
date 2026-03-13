import { describe, it, expect, vi } from "vitest";

vi.mock("@/shared/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "new-1", name: "New Patient", clinic_id: "c1" },
        error: null,
      }),
    }),
  }),
}));

vi.mock("@/shared/store/auth-store", () => ({
  useAuthStore: (selector: any) =>
    selector({ clinicId: "clinic-1", user: { id: "user-1" } }),
}));

describe("useCreatingPatient", () => {
  it("is defined as a function", async () => {
    const { useCreatingPatient } = await import("../use-creating-patient");
    expect(typeof useCreatingPatient).toBe("function");
  });
});
