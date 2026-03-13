import { describe, it, expect, vi } from "vitest";
import { buildEmbeddingText } from "../embeddings";

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }],
      }),
    },
  })),
}));

describe("buildEmbeddingText", () => {
  it("builds text from fields", () => {
    const result = buildEmbeddingText({
      name: "John",
      phone: "010-1234-5678",
      email: null,
    });
    expect(result).toBe("name: John\nphone: 010-1234-5678");
  });

  it("filters out null and undefined values", () => {
    const result = buildEmbeddingText({
      name: "John",
      address: null,
      notes: undefined,
    });
    expect(result).toBe("name: John");
  });

  it("returns empty string for all null fields", () => {
    const result = buildEmbeddingText({ a: null, b: undefined });
    expect(result).toBe("");
  });
});
