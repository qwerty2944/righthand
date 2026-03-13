import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

const mockSelect = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockIs = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockRange = vi.fn().mockReturnThis();
const mockIlike = vi.fn().mockReturnThis();

vi.mock("@/shared/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: mockSelect,
      eq: mockEq,
      is: mockIs,
      order: mockOrder,
      range: (...args: any[]) => {
        mockRange(...args);
        return {
          then: undefined,
          data: [{ id: "1", name: "Test Patient", clinic_id: "c1" }],
          error: null,
          count: 1,
          ilike: mockIlike,
        };
      },
      ilike: mockIlike,
    }),
  }),
}));

vi.mock("@/shared/store/auth-store", () => ({
  useAuthStore: (selector: any) => selector({ clinicId: "clinic-1" }),
}));

describe("useGetPatients", () => {
  it("is defined as a function", async () => {
    const { useGetPatients } = await import("../get-patients");
    expect(typeof useGetPatients).toBe("function");
  });
});
