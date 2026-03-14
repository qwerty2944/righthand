import { createAdminClient } from "@/shared/lib/supabase/admin";

// --- A. Gemini Tool Definitions ---

export const CLINIC_TOOLS = [
  {
    name: "update_patient",
    description:
      "Update patient information such as phone, email, address, notes, birth_date, or gender. Use when the user requests modifying a patient's data.",
    parameters: {
      type: "object",
      properties: {
        patient_name: { type: "string", description: "The patient's name to search for" },
        updates: {
          type: "object",
          properties: {
            phone: { type: "string", description: "New phone number" },
            email: { type: "string", description: "New email address" },
            address: { type: "string", description: "New address" },
            notes: { type: "string", description: "New notes/memo" },
            birth_date: { type: "string", description: "New birth date (YYYY-MM-DD)" },
            gender: { type: "string", enum: ["male", "female", "other"], description: "New gender" },
          },
        },
      },
      required: ["patient_name", "updates"],
    },
  },
  {
    name: "create_medical_record",
    description:
      "Create a new medical record for a patient. Use when the user wants to add a new chart entry or medical note.",
    parameters: {
      type: "object",
      properties: {
        patient_name: { type: "string", description: "The patient's name" },
        record: {
          type: "object",
          properties: {
            chief_complaint: { type: "string", description: "Chief complaint / main symptom" },
            subjective: { type: "string", description: "Subjective findings" },
            objective: { type: "string", description: "Objective findings" },
            assessment: { type: "string", description: "Assessment / diagnosis" },
            plan: { type: "string", description: "Treatment plan" },
          },
        },
      },
      required: ["patient_name", "record"],
    },
  },
  {
    name: "update_medical_record",
    description:
      "Update the most recent medical record for a patient. Use when the user wants to modify existing chart data.",
    parameters: {
      type: "object",
      properties: {
        patient_name: { type: "string", description: "The patient's name" },
        record_date_hint: {
          type: "string",
          description: "Optional date hint to find a specific record (YYYY-MM-DD)",
        },
        updates: {
          type: "object",
          properties: {
            chief_complaint: { type: "string", description: "Updated chief complaint" },
            subjective: { type: "string", description: "Updated subjective findings" },
            objective: { type: "string", description: "Updated objective findings" },
            assessment: { type: "string", description: "Updated assessment" },
            plan: { type: "string", description: "Updated treatment plan" },
          },
        },
      },
      required: ["patient_name", "updates"],
    },
  },
];

// --- B. Action Types ---

type UpdatePatientAction = {
  action: "update_patient";
  patient_id: string;
  patient_name: string;
  updates: Record<string, string>;
  previous: Record<string, string | null>;
};

type CreateMedicalRecordAction = {
  action: "create_medical_record";
  patient_id: string;
  clinic_id: string;
  patient_name: string;
  record: Record<string, string>;
};

type UpdateMedicalRecordAction = {
  action: "update_medical_record";
  record_id: string;
  patient_name: string;
  updates: Record<string, string>;
  previous: Record<string, string | null>;
};

export type SlackAction = UpdatePatientAction | CreateMedicalRecordAction | UpdateMedicalRecordAction;

// --- C. Entity Resolution ---

type PatientResult =
  | { status: "found"; patient: { id: string; name: string; [key: string]: unknown } }
  | { status: "multiple"; patients: Array<{ name: string; chart_number: string | null; birth_date: string }> }
  | { status: "not_found" };

async function resolvePatient(
  admin: ReturnType<typeof createAdminClient>,
  clinicId: string,
  name: string,
): Promise<PatientResult> {
  const { data: patients } = await (admin as any)
    .from("patients")
    .select("id, name, chart_number, birth_date, gender, phone, email, address, notes")
    .eq("clinic_id", clinicId)
    .is("deleted_at", null)
    .ilike("name", `%${name}%`);

  if (!patients || patients.length === 0) return { status: "not_found" };

  const exact = patients.filter((p: any) => p.name === name);
  if (exact.length === 1) return { status: "found", patient: exact[0] };
  if (patients.length === 1) return { status: "found", patient: patients[0] };

  return {
    status: "multiple",
    patients: patients.map((p: any) => ({
      name: p.name,
      chart_number: p.chart_number,
      birth_date: p.birth_date,
    })),
  };
}

async function resolveLatestRecord(
  admin: ReturnType<typeof createAdminClient>,
  patientId: string,
  dateHint?: string,
): Promise<any | null> {
  let query = (admin as any)
    .from("medical_records")
    .select("id, chief_complaint, subjective, objective, assessment, plan, created_at, status")
    .eq("patient_id", patientId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (dateHint) {
    query = query.gte("created_at", `${dateHint}T00:00:00`).lte("created_at", `${dateHint}T23:59:59`);
  }

  const { data } = await query;
  return data?.[0] ?? null;
}

// --- D. Confirmation Message Builder ---

const FIELD_LABELS: Record<string, string> = {
  phone: "연락처",
  email: "이메일",
  address: "주소",
  notes: "메모",
  birth_date: "생년월일",
  gender: "성별",
  chief_complaint: "주증상",
  subjective: "주관적 소견",
  objective: "객관적 소견",
  assessment: "평가",
  plan: "치료계획",
};

function formatGender(val: string | null | undefined): string {
  if (!val) return "(없음)";
  if (val === "male") return "남";
  if (val === "female") return "여";
  return "기타";
}

function formatFieldValue(key: string, val: string | null | undefined): string {
  if (key === "gender") return formatGender(val);
  return val || "(없음)";
}

export function buildConfirmationBlocks(action: SlackAction): any[] {
  const actionJson = JSON.stringify(action);
  if (actionJson.length > 1900) {
    return [
      {
        type: "section",
        text: { type: "mrkdwn", text: "변경 항목이 너무 많습니다. 항목을 나누어 요청해주세요." },
      },
    ];
  }

  let headerText: string;
  let previewLines: string[];

  switch (action.action) {
    case "update_patient": {
      headerText = "환자 정보 변경 확인";
      previewLines = Object.keys(action.updates).map((key) => {
        const label = FIELD_LABELS[key] ?? key;
        const oldVal = formatFieldValue(key, action.previous[key]);
        const newVal = formatFieldValue(key, action.updates[key]);
        return `*${label}:* ${oldVal} -> ${newVal}`;
      });
      break;
    }
    case "create_medical_record": {
      headerText = "진료기록 생성 확인";
      previewLines = Object.entries(action.record).map(([key, val]) => {
        const label = FIELD_LABELS[key] ?? key;
        return `*${label}:* ${val}`;
      });
      break;
    }
    case "update_medical_record": {
      headerText = "진료기록 수정 확인";
      previewLines = Object.keys(action.updates).map((key) => {
        const label = FIELD_LABELS[key] ?? key;
        const oldVal = formatFieldValue(key, action.previous[key]);
        const newVal = formatFieldValue(key, action.updates[key]);
        return `*${label}:* ${oldVal} -> ${newVal}`;
      });
      break;
    }
  }

  return [
    { type: "header", text: { type: "plain_text", text: headerText } },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*환자:* ${action.patient_name}\n${previewLines.join("\n")}`,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "확인" },
          style: "primary",
          action_id: "confirm_action",
          value: actionJson,
        },
        {
          type: "button",
          text: { type: "plain_text", text: "취소" },
          style: "danger",
          action_id: "cancel_action",
          value: "cancel",
        },
      ],
    },
  ];
}

// --- E. Action Execution ---

export async function executeAction(action: SlackAction): Promise<string> {
  const admin = createAdminClient();

  switch (action.action) {
    case "update_patient": {
      const { error } = await (admin as any)
        .from("patients")
        .update({ ...action.updates, updated_at: new Date().toISOString() })
        .eq("id", action.patient_id);
      if (error) throw new Error(`환자 정보 업데이트 실패: ${error.message}`);
      const fields = Object.keys(action.updates)
        .map((k) => FIELD_LABELS[k] ?? k)
        .join(", ");
      return `${action.patient_name} 환자의 ${fields} 정보가 업데이트되었습니다.`;
    }

    case "create_medical_record": {
      const { error } = await (admin as any).from("medical_records").insert({
        clinic_id: action.clinic_id,
        patient_id: action.patient_id,
        ...action.record,
        status: "draft",
      });
      if (error) throw new Error(`진료기록 생성 실패: ${error.message}`);
      return `${action.patient_name} 환자의 진료기록이 생성되었습니다. (상태: 초안)`;
    }

    case "update_medical_record": {
      const { error } = await (admin as any)
        .from("medical_records")
        .update({ ...action.updates, updated_at: new Date().toISOString() })
        .eq("id", action.record_id);
      if (error) throw new Error(`진료기록 수정 실패: ${error.message}`);
      const fields = Object.keys(action.updates)
        .map((k) => FIELD_LABELS[k] ?? k)
        .join(", ");
      return `${action.patient_name} 환자의 진료기록(${fields})이 수정되었습니다.`;
    }
  }
}

// --- F. Orchestration ---

export type ProcessResult =
  | { type: "blocks"; blocks: any[] }
  | { type: "text"; text: string };

export async function processFunctionCall(
  name: string,
  args: Record<string, unknown>,
  clinicId: string,
): Promise<ProcessResult> {
  const admin = createAdminClient();
  const patientName = args.patient_name as string;
  if (!patientName) return { type: "text", text: "환자 이름을 확인할 수 없습니다." };

  const result = await resolvePatient(admin, clinicId, patientName);

  if (result.status === "not_found") {
    return { type: "text", text: `"${patientName}" 환자를 찾을 수 없습니다.` };
  }

  if (result.status === "multiple") {
    const list = result.patients
      .map((p) => `- ${p.name} (차트번호: ${p.chart_number ?? "없음"}, 생년월일: ${p.birth_date})`)
      .join("\n");
    return {
      type: "text",
      text: `동명이인이 있습니다. 차트번호나 생년월일을 포함하여 다시 요청해주세요.\n${list}`,
    };
  }

  const patient = result.patient;

  switch (name) {
    case "update_patient": {
      const updates = (args.updates ?? {}) as Record<string, string>;
      const previous: Record<string, string | null> = {};
      for (const key of Object.keys(updates)) {
        previous[key] = (patient as any)[key] ?? null;
      }
      const action: SlackAction = {
        action: "update_patient",
        patient_id: patient.id,
        patient_name: patient.name as string,
        updates,
        previous,
      };
      return { type: "blocks", blocks: buildConfirmationBlocks(action) };
    }

    case "create_medical_record": {
      const record = (args.record ?? {}) as Record<string, string>;
      const action: SlackAction = {
        action: "create_medical_record",
        patient_id: patient.id,
        clinic_id: clinicId,
        patient_name: patient.name as string,
        record,
      };
      return { type: "blocks", blocks: buildConfirmationBlocks(action) };
    }

    case "update_medical_record": {
      const dateHint = args.record_date_hint as string | undefined;
      const latestRecord = await resolveLatestRecord(admin, patient.id, dateHint);
      if (!latestRecord) {
        return {
          type: "text",
          text: `${patient.name} 환자의 진료기록이 없습니다. 먼저 생성해주세요.`,
        };
      }
      const updates = (args.updates ?? {}) as Record<string, string>;
      const previous: Record<string, string | null> = {};
      for (const key of Object.keys(updates)) {
        previous[key] = latestRecord[key] ?? null;
      }
      const action: SlackAction = {
        action: "update_medical_record",
        record_id: latestRecord.id,
        patient_name: patient.name as string,
        updates,
        previous,
      };
      return { type: "blocks", blocks: buildConfirmationBlocks(action) };
    }

    default:
      return { type: "text", text: `알 수 없는 작업: ${name}` };
  }
}
