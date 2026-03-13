"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetPatients } from "@/entities/patient";
import { useCreatingMedicalRecord } from "@/features/creatingMedicalRecord";
import { Button, Input, Loading } from "@/shared/ui";

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const { data: patientsData, isLoading: patientsLoading } = useGetPatients({ page: 1, limit: 100 });
  const createRecord = useCreatingMedicalRecord();

  const [patientId, setPatientId] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  if (patientsLoading) return <Loading className="py-20" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;

    await createRecord.mutateAsync({
      patient_id: patientId,
      chief_complaint: chiefComplaint || null,
      subjective: subjective || null,
      objective: objective || null,
      assessment: assessment || null,
      plan: plan || null,
      status: "draft",
    });
    router.push("/medical-records");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">새 진료기록</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">환자 선택</label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          >
            <option value="">환자를 선택하세요</option>
            {patientsData?.data.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.chart_number || "차트번호 없음"})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">주소 (Chief Complaint)</label>
          <Input value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="주요 증상" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">주관적 소견 (S)</label>
          <textarea
            className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]"
            value={subjective}
            onChange={(e) => setSubjective(e.target.value)}
            placeholder="환자가 호소하는 증상"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">객관적 소견 (O)</label>
          <textarea
            className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="검사 결과, 활력 징후 등"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">평가 (A)</label>
          <textarea
            className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]"
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            placeholder="진단"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">계획 (P)</label>
          <textarea
            className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="치료 계획"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={createRecord.isPending}>
            {createRecord.isPending ? "저장 중..." : "저장"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>취소</Button>
        </div>
      </form>
    </div>
  );
}
