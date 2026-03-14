const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

type GeminiToolResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        functionCall?: { name: string; args: Record<string, unknown> };
      }>;
    };
  }>;
};

export type GeminiToolResult =
  | { type: "text"; text: string }
  | { type: "functionCall"; name: string; args: Record<string, unknown> };

export async function askGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as GeminiResponse;
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "응답을 생성하지 못했습니다.";
}

export async function askGeminiWithTools(
  prompt: string,
  tools: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>,
): Promise<GeminiToolResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ functionDeclarations: tools }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as GeminiToolResponse;
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts?.length) return { type: "text", text: "응답을 생성하지 못했습니다." };

  const fcPart = parts.find((p) => p.functionCall);
  if (fcPart?.functionCall) {
    return {
      type: "functionCall",
      name: fcPart.functionCall.name,
      args: fcPart.functionCall.args,
    };
  }

  const textPart = parts.find((p) => p.text);
  return { type: "text", text: textPart?.text ?? "응답을 생성하지 못했습니다." };
}
