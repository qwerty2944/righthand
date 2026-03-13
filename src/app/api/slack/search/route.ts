import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { generateEmbedding } from "@/shared/lib/embeddings";

export async function POST(request: NextRequest) {
  try {
    const { query, clinic_id } = await request.json();
    if (!query || !clinic_id) {
      return NextResponse.json({ error: "query and clinic_id required" }, { status: 400 });
    }

    const embedding = await generateEmbedding(query);
    const admin = createAdminClient();
    const { data, error } = await (admin.rpc as any)("search_by_embedding", {
      query_embedding: JSON.stringify(embedding),
      match_threshold: 0.6,
      match_count: 10,
      p_clinic_id: clinic_id,
    });

    if (error) throw error;

    const blocks = [
      { type: "section", text: { type: "mrkdwn", text: `*Results for:* "${query}"` } },
      { type: "divider" },
      ...(data ?? []).map((r: any) => ({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*[${r.source_table}]* ${r.content}\n_${Math.round(r.similarity * 100)}% match_`,
        },
      })),
    ];

    return NextResponse.json({ blocks, results: data });
  } catch (err) {
    console.error("Slack search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
