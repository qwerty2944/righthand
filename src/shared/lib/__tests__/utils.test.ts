import { describe, it, expect } from "vitest";
import { cn, formatDate, formatPhone, truncateId } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });
});

describe("formatDate", () => {
  it("formats date with default format", () => {
    const result = formatDate("2024-03-15");
    expect(result).toBe("2024-03-15");
  });

  it("formats date with custom format", () => {
    const result = formatDate("2024-03-15", "yyyy/MM/dd");
    expect(result).toBe("2024/03/15");
  });
});

describe("formatPhone", () => {
  it("formats 11-digit phone number", () => {
    expect(formatPhone("01012345678")).toBe("010-1234-5678");
  });

  it("formats 10-digit phone number", () => {
    expect(formatPhone("0212345678")).toBe("021-234-5678");
  });

  it("returns original for non-standard format", () => {
    expect(formatPhone("123")).toBe("123");
  });
});

describe("truncateId", () => {
  it("truncates UUID to default length", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(truncateId(uuid)).toBe("550e8400");
  });

  it("truncates to custom length", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(truncateId(uuid, 4)).toBe("550e");
  });
});
