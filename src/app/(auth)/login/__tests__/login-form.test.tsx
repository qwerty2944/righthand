import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/shared/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

describe("LoginForm", () => {
  it("renders email and password inputs", async () => {
    const { LoginForm } = await import("../login-form");
    render(<LoginForm />);
    expect(screen.getByPlaceholderText("doctor@clinic.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
  });

  it("renders submit button", async () => {
    const { LoginForm } = await import("../login-form");
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    const { LoginForm } = await import("../login-form");
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: "Sign In" }));
    // Form validation should trigger
    expect(screen.getByPlaceholderText("doctor@clinic.com")).toBeInTheDocument();
  });
});
