"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetMedicalRecord } from "@/entities/medical-record";
import { Button, Badge, Loading } from "@/shared/ui";

const statusLabel: Record<string, string> = {
  draft: "작성중",
  finalized: "확정",
  amended: "수정됨",
};

export default function MedicalRecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: record, isLoading } = useGetMedicalRecord(id);

  if (isLoading) return <Loading className="py-20" />;
  if (!record) return <div className="py-20 text-center text-muted-foreground">진료기록을 찾을 수 없습니다</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">진료기록 상세</h1>
        <Badge variant={record.status === "finalized" ? "default" : "secondary"}>
          {statusLabel[record.status] ?? record.status}
        </Badge>
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
