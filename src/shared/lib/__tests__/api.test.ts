import { describe, it, expect, vi } from "vitest";

vi.mock("@/shared/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "test-token" } },
      }),
    },
  }),
}));

describe("API client", () => {
  it("creates axios instance with correct baseURL", async () => {
    const api = (await import("../api")).default;
    expect(api.defaults.baseURL).toBe("/api");
  });

  it("has correct content type header", async () => {
    const api = (await import("../api")).default;
    expect(api.defaults.headers["Content-Type"]).toBe("application/json");
  });
});
