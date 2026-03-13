"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetMedicalRecord } from "@/entities/medical-record";
import { useUpdatingMedicalRecord } from "@/features/updatingMedicalRecord";
import { Button, Badge, Input, Loading } from "@/shared/ui";

const statusLabel: Record<string, string> = {
  draft: "작성중",
  finalized: "확정",
  amended: "수정됨",
};

export default function MedicalRecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: record, isLoading } = useGetMedicalRecord(id);
  const updateRecord = useUpdatingMedicalRecord();

  const [editing, setEditing] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState<string>("draft");

  useEffect(() => {
    if (record) {
      setChiefComplaint(record.chief_complaint ?? "");
      setSubjective(record.subjective ?? "");
      setObjective(record.objective ?? "");
      setAssessment(record.assessment ?? "");
      setPlan(record.plan ?? "");
      setStatus(record.status);
    }
  }, [record]);

  if (isLoading) return <Loading className="py-20" />;
  if (!record) return <div className="py-20 text-center text-muted-foreground">진료기록을 찾을 수 없습니다</div>;

  const handleSave = async () => {
    await updateRecord.mutateAsync({
      id: record.id,
      data: {
        chief_complaint: chiefComplaint || null,
        subjective: subjective || null,
        objective: objective || null,
        assessment: assessment || null,
        plan: plan || null,
        status: status as "draft" | "finalized" | "amended",
      },
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">진료기록 수정</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">상태</label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="draft">작성중</option>
              <option value="finalized">확정</option>
              <option value="amended">수정됨</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">주소 (Chief Complaint)</label>
            <Input value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">주관적 소견 (S)</label>
            <textarea className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]" value={subjective} onChange={(e) => setSubjective(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">객관적 소견 (O)</label>
            <textarea className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]" value={objective} onChange={(e) => setObjective(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">평가 (A)</label>
            <textarea className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]" value={assessment} onChange={(e) => setAssessment(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">계획 (P)</label>
            <textarea className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]" value={plan} onChange={(e) => setPlan(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={updateRecord.isPending}>
              {updateRecord.isPending ? "저장 중..." : "저장"}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>취소</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">진료기록 상세</h1>
        <div className="flex gap-2 items-center">
          <Badge variant={record.status === "finalized" ? "default" : "secondary"}>
            {statusLabel[record.status] ?? record.status}
          </Badge>
          <Button onClick={() => setEditing(true)}>수정</Button>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <div>
          <span className="text-sm text-muted-foreground">작성일</span>
          <p>{record.created_at?.slice(0, 10)}</p>
        </div>

        {record.chief_complaint && (
          <div>
            <span className="text-sm text-muted-foreground">주소 (C/C)</span>
            <p>{record.chief_complaint}</p>
          </div>
        )}

        {record.subjective && (
          <div>
            <span className="text-sm text-muted-foreground">주관적 소견 (S)</span>
            <p className="whitespace-pre-wrap">{record.subjective}</p>
          </div>
        )}

        {record.objective && (
          <div>
            <span className="text-sm text-muted-foreground">객관적 소견 (O)</span>
            <p className="whitespace-pre-wrap">{record.objective}</p>
          </div>
        )}

        {record.assessment && (
          <div>
            <span className="text-sm text-muted-foreground">평가 (A)</span>
            <p className="whitespace-pre-wrap">{record.assessment}</p>
          </div>
        )}

        {record.plan && (
          <div>
            <span className="text-sm text-muted-foreground">계획 (P)</span>
            <p className="whitespace-pre-wrap">{record.plan}</p>
          </div>
        )}
      </div>

      <Button variant="outline" onClick={() => router.back()}>뒤로가기</Button>
    </div>
  );
}
