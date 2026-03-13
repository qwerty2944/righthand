import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { generateEmbedding, buildEmbeddingText } from "@/shared/lib/embeddings";

type WebhookPayload = {
  type: "INSERT" | "UPDATE";
  table: string;
  record: Record<string, unknown>;
  old_record: Record<string, unknown> | null;
};

const TABLE_FIELDS: Record<string, string[]> = {
  patients: ["name", "phone", "chart_number", "notes"],
  appointments: ["status", "notes"],
  billing_items: ["billing_code", "description", "status"],
  medical_records: ["subjective", "objective", "assessment", "plan"],
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as WebhookPayload;
  const { table, record } = payload;

  const fields = TABLE_FIELDS[table];
  if (!fields || !record.id) {
    return NextResponse.json({ error: "Unknown table or missing id" }, { status: 400 });
  }

  // Respond immediately, process embedding in background
  const processEmbedding = async (): Promise<void> => {
    try {
      const embeddingFields: Record<string, string | null | undefined> = {};

      for (const field of fields) {
        embeddingFields[field] = record[field] as string | null | undefined;
      }

      // For appointments, join patient name
      if (table === "appointments" && record.patient_id) {
        const admin = createAdminClient();
        const { data: patient } = await (admin as any)
          .from("patients")
          .select("name")
          .eq("id", record.patient_id)
          .single();
        if (patient) {
          embeddingFields["patient_name"] = patient.name;
        }
      }

      const text = buildEmbeddingText(embeddingFields);
      if (!text.trim()) return;

      const embedding = await generateEmbedding(text);

      const admin = createAdminClient();
      await (admin as any)
        .from(table)
        .update({ embedding: JSON.stringify(embedding) })
        .eq("id", record.id);
    } catch (err) {
      console.error(`[webhook/embedding] Error processing ${table}/${record.id}:`, err);
    }
  };

  // Fire and forget - don't await
  processEmbedding();

  return NextResponse.json({ success: true });
}
