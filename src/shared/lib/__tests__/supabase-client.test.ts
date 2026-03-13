import { describe, it, expect, vi } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({
    auth: { getUser: vi.fn(), onAuthStateChange: vi.fn() },
    from: vi.fn(),
  })),
  createServerClient: vi.fn(() => ({
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn() },
    from: vi.fn(),
    rpc: vi.fn(),
  })),
}));

describe("Supabase client", () => {
  it("creates browser client", async () => {
    const { createClient } = await import("../supabase/client");
    const client = createClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it("creates admin client", async () => {
    const { createAdminClient } = await import("../supabase/admin");
    const client = createAdminClient();
    expect(client).toBeDefined();
  });
});
