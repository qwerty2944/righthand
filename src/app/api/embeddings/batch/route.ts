import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { generateEmbedding, buildEmbeddingText } from "@/shared/lib/embeddings";

type TableConfig = {
  table: string;
  fields: string[];
  patientJoin?: boolean;
};

const TABLES: TableConfig[] = [
  { table: "patients", fields: ["name", "phone", "chart_number", "notes"] },
  { table: "appointments", fields: ["status", "notes"], patientJoin: true },
  { table: "billing_items", fields: ["billing_code", "description", "status"] },
  {
    table: "medical_records",
    fields: ["subjective", "objective", "assessment", "plan", "chief_complaint"],
    patientJoin: true,
  },
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const targetTable = (body as Record<string, unknown>).table as string | undefined;
  const clinicId = (body as Record<string, unknown>).clinic_id as string | undefined;

  const admin = createAdminClient();
  const stats: Record<string, { total: number; processed: number; errors: number }> = {};

  const tablesToProcess = targetTable
    ? TABLES.filter((t) => t.table === targetTable)
    : TABLES;

  for (const config of tablesToProcess) {
    stats[config.table] = { total: 0, processed: 0, errors: 0 };

    let query = (admin as any)
      .from(config.table)
      .select(["id", ...config.fields, ...(config.patientJoin ? ["patient_id"] : [])].join(", "))
      .is("embedding", null);

    if (config.table === "patients" || config.table === "medical_records") {
      query = query.is("deleted_at", null);
    }

    if (clinicId) {
      query = query.eq("clinic_id", clinicId);
    }

    const { data: rows, error } = await query.limit(500);

    if (error) {
      console.error(`[batch-embed] Error fetching ${config.table}:`, error);
      continue;
    }

    if (!rows) continue;
    stats[config.table].total = rows.length;

    for (const row of rows) {
      try {
        const embeddingFields: Record<string, string | null | undefined> = {};
        for (const field of config.fields) {
          embeddingFields[field] = row[field] as string | null | undefined;
        }

        // Join patient name for appointments and medical_records
        if (config.patientJoin && row.patient_id) {
          const { data: patient } = await (admin as any)
            .from("patients")
            .select("name")
            .eq("id", row.patient_id)
            .single();
          if (patient) {
            embeddingFields["patient_name"] = patient.name;
          }
        }

        const text = buildEmbeddingText(embeddingFields);
        if (!text.trim()) continue;

        const embedding = await generateEmbedding(text);
        await (admin as any)
          .from(config.table)
          .update({ embedding: JSON.stringify(embedding) })
          .eq("id", row.id);

        stats[config.table].processed++;
      } catch (err) {
        console.error(`[batch-embed] Error processing ${config.table}/${row.id}:`, err);
        stats[config.table].errors++;
      }
    }
  }

  return NextResponse.json({ success: true, stats });
}
