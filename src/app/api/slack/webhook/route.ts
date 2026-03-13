import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { askGemini } from "@/shared/lib/gemini";

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

  const sigBuffer = Buffer.from(mySignature);
  const reqBuffer = Buffer.from(signature);
  if (sigBuffer.length !== reqBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, reqBuffer);
}

async function postSlackMessage(
  botToken: string,
  channel: string,
  threadTs: string,
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
      text,
    }),
  });
}

async function getClinicId(admin: ReturnType<typeof createAdminClient>): Promise<string | null> {
  // Try to get the first clinic (single-tenant for now)
  const { data } = await (admin as any)
    .from("clinics")
    .select("id")
    .limit(1)
    .single();
  return data?.id ?? null;
}

async function fetchClinicData(
  admin: ReturnType<typeof createAdminClient>,
  clinicId: string,
  query: string,
): Promise<string> {
  const { data: patients } = await (admin as any)
    .from("patients")
    .select("id, name, chart_number, birth_date, gender, phone, email, address, notes")
    .eq("clinic_id", clinicId)
    .is("deleted_at", null);

  if (!patients || patients.length === 0) {
    return "등록된 환자가 없습니다.";
  }

  // Strip @mention tags from query for matching
  const cleanQuery = query.replace(/<@[A-Z0-9]+>/g, "").trim().toLowerCase();

  // Find matching patients by name
  const matched = patients.filter((p: any) =>
    cleanQuery.includes(p.name?.toLowerCase() ?? ""),
  );

  const targetPatients = matched.length > 0 ? matched : patients;

  const patientDetails: string[] = [];

  for (const patient of targetPatients.slice(0, 5)) {
    const [appointmentsRes, recordsRes, billingRes] = await Promise.all([
      (admin as any)
        .from("appointments")
        .select("appointment_date, start_time, end_time, status, notes")
        .eq("patient_id", patient.id)
        .order("appointment_date", { ascending: false })
        .limit(5),
      (admin as any)
        .from("medical_records")
        .select("chief_complaint, subjective, objective, assessment, plan, created_at, status")
        .eq("patient_id", patient.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(5),
      (admin as any)
        .from("billing_items")
        .select("billing_code, description, amount, status, created_at")
        .eq("patient_id", patient.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    let detail = `[환자] 이름: ${patient.name}`;
    if (patient.chart_number) detail += `, 차트번호: ${patient.chart_number}`;
    if (patient.birth_date) detail += `, 생년월일: ${patient.birth_date}`;
    if (patient.gender) detail += `, 성별: ${patient.gender === "male" ? "남" : patient.gender === "female" ? "여" : "기타"}`;
    if (patient.phone) detail += `, 연락처: ${patient.phone}`;
    if (patient.email) detail += `, 이메일: ${patient.email}`;
    if (patient.address) detail += `, 주소: ${patient.address}`;
    if (patient.notes) detail += `, 메모: ${patient.notes}`;

    if (appointmentsRes.data?.length) {
      detail += "\n[예약 내역]";
      for (const a of appointmentsRes.data) {
        detail += `\n- ${a.appointment_date} ${a.start_time}-${a.end_time} (${a.status})${a.notes ? ` ${a.notes}` : ""}`;
      }
    }

    if (recordsRes.data?.length) {
      detail += "\n[진료기록]";
      for (const r of recordsRes.data) {
        const parts = [];
        if (r.chief_complaint) parts.push(`주소: ${r.chief_complaint}`);
        if (r.assessment) parts.push(`평가: ${r.assessment}`);
        if (r.plan) parts.push(`계획: ${r.plan}`);
        detail += `\n- ${r.created_at?.slice(0, 10)} (${r.status}) ${parts.join(", ")}`;
      }
    }

    if (billingRes.data?.length) {
      detail += "\n[수납 내역]";
      for (const b of billingRes.data) {
        detail += `\n- ${b.billing_code} ${b.description} ${b.amount}원 (${b.status})`;
      }
    }

    patientDetails.push(detail);
  }

  return patientDetails.join("\n\n");
}

async function handleQuestion(
  event: any,
): Promise<void> {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) {
    console.error("SLACK_BOT_TOKEN not set");
    return;
  }

  try {
    const admin = createAdminClient();

    // Get clinic ID (single-tenant: use first clinic)
    const clinicId = await getClinicId(admin);
    if (!clinicId) {
      await postSlackMessage(botToken, event.channel, event.ts, "등록된 클리닉이 없습니다.");
      return;
    }

    const query = event.text;
    const clinicData = await fetchClinicData(admin, clinicId, query);

    const prompt = `당신은 병원 관리 시스템의 AI 어시스턴트입니다. 슬랙에서 의료진이 질문하면 환자 데이터를 기반으로 정확하고 간결하게 답변합니다.

규칙:
- 한국어로 답변
- 간결하고 핵심만 전달 (슬랙 메시지에 적합하게)
- 데이터에 없는 내용은 추측하지 말고 "해당 정보가 없습니다"라고 답변
- 나이 질문 시 생년월일로 계산 (오늘: ${new Date().toISOString().slice(0, 10)})
- 민감 정보는 주의해서 다루되, 의료진의 업무 질문이므로 필요한 정보는 제공
- @멘션 태그(<@...>)는 무시하고 질문 내용에만 집중

[병원 데이터]
${clinicData}

[질문]
${query}`;

    const answer = await askGemini(prompt);

    await postSlackMessage(botToken, event.channel, event.ts, answer);

    // Log event (best effort)
    await (admin as any).from("slack_event_log").insert({
      clinic_id: clinicId,
      event_type: event.type,
      event_data: event,
    }).then(() => {}).catch(() => {});
  } catch (err: unknown) {
    console.error("handleQuestion error:", err);
    const message = err instanceof Error ? err.message : String(err);
    await postSlackMessage(
      botToken,
      event.channel,
      event.ts,
      `오류가 발생했습니다: ${message}`,
    ).catch(() => {});
  }
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

  // Handle both @mention and direct messages
  const isAppMention = event.type === "app_mention";
  const isDirectMessage = event.type === "message" && !event.bot_id && !event.subtype;

  if ((isAppMention || isDirectMessage) && event.text) {
    // Don't await - respond to Slack within 3s, process in background
    handleQuestion(event).catch((err) => {
      console.error("Slack webhook error:", err);
    });
  }

  return NextResponse.json({ ok: true });
}
