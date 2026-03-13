import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { generateEmbedding, buildEmbeddingText } from "@/shared/lib/embeddings";

export async function POST(request: NextRequest) {
  try {
    const { table, id, fields } = await request.json();
    if (!table || !id || !fields) {
      return NextResponse.json({ error: "table, id, and fields are required" }, { status: 400 });
    }

    const allowedTables = ["patients", "appointments", "billing_items", "medical_records"];
    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    const text = buildEmbeddingText(fields);
    const embedding = await generateEmbedding(text);

    const admin = createAdminClient();
    const { error } = await (admin.from(table) as any)
      .update({ embedding: JSON.stringify(embedding) })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Embedding error:", err);
    return NextResponse.json({ error: "Embedding generation failed" }, { status: 500 });
  }
}
