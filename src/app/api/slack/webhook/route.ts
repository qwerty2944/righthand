import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { generateEmbedding } from "@/shared/lib/embeddings";

function verifySlackSignature(request: NextRequest, body: string): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return false;

  const timestamp = request.headers.get("x-slack-request-timestamp");
  const signature = request.headers.get("x-slack-signature");
  if (!timestamp || !signature) return false;

  const fiveMinAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (parseInt(timestamp) < fiveMinAgo) return false;

  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature =
    "v0=" +
    crypto.createHmac("sha256", signingSecret).update(sigBasestring).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(mySignature), Buffer.from(signature));
}

type SearchResult = {
  id: string;
  source_table: string;
  content: string;
  similarity: number;
};

type Patient = {
  id: string;
  name: string;
  chart_number: string | null;
  birth_date: string;
  gender: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

type Appointment = {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
};

type MedicalRecord = {
  id: string;
  chief_complaint: string | null;
  assessment: string | null;
  plan: string | null;
  created_at: string;
  status: string;
};

function formatGender(gender: string | null): string {
  if (!gender) return "-";
  const map: Record<string, string> = { male: "남", female: "여", other: "기타" };
  return map[gender] ?? gender;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return dateStr.replace(/-/g, ".");
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    scheduled: "예약됨",
    confirmed: "확인됨",
    in_progress: "진료중",
    completed: "완료",
    cancelled: "취소",
    no_show: "미방문",
    draft: "초안",
    finalized: "확정",
    amended: "수정됨",
  };
  return map[status] ?? status;
}

function buildPatientCard(
  patient: Patient,
  appointments: Appointment[],
  records: MedicalRecord[],
  similarity: number,
): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `${patient.name} 환자 정보`, emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*차트번호:*\n${patient.chart_number ?? "-"}` },
        { type: "mrkdwn", text: `*생년월일:*\n${formatDate(patient.birth_date)}` },
        { type: "mrkdwn", text: `*성별:*\n${formatGender(patient.gender)}` },
        { type: "mrkdwn", text: `*연락처:*\n${patient.phone ?? "-"}` },
      ],
    },
  ];

  if (patient.email) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*이메일:* ${patient.email}` },
    });
  }

  if (patient.notes) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*메모:* ${patient.notes}` },
    });
  }

  // Recent appointments
  if (appointments.length > 0) {
    blocks.push({ type: "divider" });
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*최근 예약 (${appointments.length}건)*` },
    });
    for (const apt of appointments) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `> ${formatDate(apt.appointment_date)} ${apt.start_time}-${apt.end_time} | ${formatStatus(apt.status)}${apt.notes ? ` | ${apt.notes}` : ""}`,
        },
      });
    }
  }

  // Recent medical records
  if (records.length > 0) {
    blocks.push({ type: "divider" });
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*최근 진료기록 (${records.length}건)*` },
    });
    for (const rec of records) {
      const parts: string[] = [];
      if (rec.chief_complaint) parts.push(`CC: ${rec.chief_complaint}`);
      if (rec.assessment) parts.push(`A: ${rec.assessment}`);
      if (rec.plan) parts.push(`P: ${rec.plan}`);
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `> ${formatDate(rec.created_at.slice(0, 10))} [${formatStatus(rec.status)}] ${parts.join(" | ")}`,
        },
      });
    }
  }

  blocks.push({ type: "divider" });
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Matching confidence: ${Math.round(similarity * 100)}%`,
      },
    ],
  });

  return blocks;
}

function buildGenericResults(
  query: string,
  results: SearchResult[],
): Record<string, unknown>[] {
  return [
    {
      type: "section",
      text: { type: "mrkdwn", text: `*"${query}" 검색 결과*` },
    },
    { type: "divider" },
    ...results.map((r) => ({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*[${r.source_table}]* ${r.content}\n_유사도: ${Math.round(r.similarity * 100)}%_`,
      },
    })),
  ];
}

async function fetchPatientDetails(
  admin: ReturnType<typeof createAdminClient>,
  patientId: string,
): Promise<{
  patient: Patient | null;
  appointments: Appointment[];
  records: MedicalRecord[];
}> {
  const [patientRes, appointmentsRes, recordsRes] = await Promise.all([
    (admin as any)
      .from("patients")
      .select("id, name, chart_number, birth_date, gender, phone, email, notes")
      .eq("id", patientId)
      .is("deleted_at", null)
      .single(),
    (admin as any)
      .from("appointments")
      .select("id, appointment_date, start_time, end_time, status, notes")
      .eq("patient_id", patientId)
      .order("appointment_date", { ascending: false })
      .limit(5),
    (admin as any)
      .from("medical_records")
      .select("id, chief_complaint, assessment, plan, created_at, status")
      .eq("patient_id", patientId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    patient: patientRes.data ?? null,
    appointments: appointmentsRes.data ?? [],
    records: recordsRes.data ?? [],
  };
}

async function postSlackMessage(
  botToken: string,
  channel: string,
  threadTs: string,
  blocks: Record<string, unknown>[],
  text: string,
): Promise<void> {
  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel,
      thread_ts: threadTs,
      blocks,
      text,
    }),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text();
  const payload = JSON.parse(body);

  if (payload.type === "url_verification") {
    return NextResponse.json({ challenge: payload.challenge });
  }

  if (!verifySlackSignature(request, body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = payload.event;
  if (!event) return NextResponse.json({ ok: true });

  if (event.type === "message" && !event.bot_id && event.text) {
    try {
      const admin = createAdminClient();

      // Look up clinic from Slack user mapping
      const { data: mapping } = await (admin as any)
        .from("slack_user_mappings")
        .select("clinic_id")
        .eq("slack_user_id", event.user)
        .single();

      if (!mapping) return NextResponse.json({ ok: true });

      // Get bot token for responding
      const { data: workspace } = await (admin as any)
        .from("slack_workspaces")
        .select("bot_token")
        .eq("clinic_id", mapping.clinic_id)
        .eq("is_active", true)
        .single();

      if (!workspace?.bot_token) return NextResponse.json({ ok: true });

      const query = event.text;
      const embedding = await generateEmbedding(query);
      const { data: results } = await (admin.rpc as any)("search_by_embedding", {
        query_embedding: JSON.stringify(embedding),
        match_threshold: 0.5,
        match_count: 5,
        p_clinic_id: mapping.clinic_id,
      });

      if (!results || results.length === 0) {
        await postSlackMessage(
          workspace.bot_token,
          event.channel,
          event.ts,
          [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `"${query}"에 대한 검색 결과가 없습니다.`,
              },
            },
          ],
          "검색 결과 없음",
        );
      } else {
        // Check if the top result is a patient
        const topResult = results[0] as SearchResult;

        if (topResult.source_table === "patients" && topResult.similarity >= 0.6) {
          // Fetch full patient details with related data
          const { patient, appointments, records } = await fetchPatientDetails(
            admin,
            topResult.id,
          );

          if (patient) {
            const blocks = buildPatientCard(
              patient,
              appointments,
              records,
              topResult.similarity,
            );
            await postSlackMessage(
              workspace.bot_token,
              event.channel,
              event.ts,
              blocks,
              `${patient.name} 환자 정보`,
            );

            // If there are additional results from other tables, show them too
            const otherResults = (results as SearchResult[]).filter(
              (r) => r.id !== topResult.id,
            );
            if (otherResults.length > 0) {
              const extraBlocks = buildGenericResults(query, otherResults);
              await postSlackMessage(
                workspace.bot_token,
                event.channel,
                event.ts,
                extraBlocks,
                "추가 검색 결과",
              );
            }
          }
        } else {
          // Generic search results
          const blocks = buildGenericResults(query, results as SearchResult[]);
          await postSlackMessage(
            workspace.bot_token,
            event.channel,
            event.ts,
            blocks,
            `"${query}" 검색 결과`,
          );
        }
      }

      // Log the event
      await (admin as any).from("slack_event_log").insert({
        clinic_id: mapping.clinic_id,
        event_type: event.type,
        event_data: event,
      });
    } catch (err) {
      console.error("Slack webhook error:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
