import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/shared/lib/supabase/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { generateEmbedding } from "@/shared/lib/embeddings";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const a = admin as any;
    const { data: profile } = await a
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const embedding = await generateEmbedding(query);
    const { data, error } = await a.rpc("search_by_embedding", {
      query_embedding: JSON.stringify(embedding),
      match_threshold: 0.7,
      match_count: 10,
      p_clinic_id: profile.clinic_id,
    });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
