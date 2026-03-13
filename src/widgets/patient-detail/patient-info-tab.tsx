"use client";

import { formatDate, formatPhone } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui";
import type { Patient } from "@/shared/types";

interface PatientInfoTabProps {
  patient: Patient;
}

const infoRow = (label: string, value: string | null | undefined) => (
  <div className="flex justify-between py-2 border-b border-border/50 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium">{value ?? "-"}</span>
  </div>
);

export function PatientInfoTab({ patient }: PatientInfoTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          기본 정보
        </h3>
        {infoRow("차트번호", patient.chart_number)}
        {infoRow("생년월일", formatDate(patient.birth_date))}
        <div className="flex justify-between py-2 border-b border-border/50">
          <span className="text-sm text-muted-foreground">성별</span>
          <Badge variant="secondary">{patient.gender}</Badge>
        </div>
        {infoRow("연락처", patient.phone ? formatPhone(patient.phone) : null)}
        {infoRow("이메일", patient.email)}
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          추가 정보
        </h3>
        {infoRow("주소", patient.address)}
        <div className="py-2">
          <span className="text-sm text-muted-foreground">비고</span>
          <p className="mt-1 text-sm">{patient.notes ?? "-"}</p>
        </div>
      </div>
    </div>
  );
}
