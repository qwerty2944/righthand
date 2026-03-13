import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { clinic_id } = await request.json();
    if (!clinic_id) {
      return NextResponse.json({ error: "clinic_id required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const a = admin as any;
    const today = new Date().toISOString().split("T")[0];

    const [settings, appointments, waitlist, billing] = await Promise.all([
      a.from("briefing_settings").select("*").eq("clinic_id", clinic_id).single(),
      a.from("appointments").select("*, patient:patients(name)").eq("clinic_id", clinic_id).eq("appointment_date", today).order("start_time"),
      a.from("waitlist").select("*, patient:patients(name)").eq("clinic_id", clinic_id).eq("status", "waiting"),
      a.from("billing_items").select("*", { count: "exact", head: true }).eq("clinic_id", clinic_id).in("status", ["draft", "confirmed"]),
    ]);

    if (!settings.data?.is_enabled) {
      return NextResponse.json({ error: "Briefing disabled" }, { status: 400 });
    }

    const blocks: any[] = [
      { type: "header", text: { type: "plain_text", text: `Morning Briefing - ${today}` } },
    ];

    if (settings.data.include_appointments) {
      blocks.push(
        { type: "section", text: { type: "mrkdwn", text: `*Today's Appointments:* ${appointments.data?.length ?? 0}` } },
        ...(appointments.data ?? []).slice(0, 10).map((apt: any) => ({
          type: "section",
          text: { type: "mrkdwn", text: `- ${apt.start_time} ${apt.patient?.name ?? "Unknown"} (${apt.status})` },
        })),
      );
    }

    if (settings.data.include_waitlist) {
      blocks.push({ type: "section", text: { type: "mrkdwn", text: `*Waiting:* ${waitlist.data?.length ?? 0} patients` } });
    }

    if (settings.data.include_billing) {
      blocks.push({ type: "section", text: { type: "mrkdwn", text: `*Pending Billing:* ${billing.count ?? 0} items` } });
    }

    const { data: workspace } = await a
      .from("slack_workspaces")
      .select("bot_token")
      .eq("clinic_id", clinic_id)
      .single();

    if (workspace) {
      const resp = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${workspace.bot_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channel: settings.data.channel_id, blocks }),
      });
      const result = await resp.json();

      await a.from("briefing_logs").insert({
        clinic_id,
        briefing_date: today,
        content: { blocks, appointments_count: appointments.data?.length },
        slack_message_ts: result.ts,
        status: result.ok ? "sent" : "failed",
      });
    }

    return NextResponse.json({ ok: true, blocks });
  } catch (err) {
    console.error("Briefing error:", err);
    return NextResponse.json({ error: "Briefing failed" }, { status: 500 });
  }
}
