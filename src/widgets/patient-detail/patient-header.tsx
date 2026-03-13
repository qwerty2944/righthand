"use client";

import Link from "next/link";
import { Button, Badge } from "@/shared/ui";
import { formatDate, formatPhone } from "@/shared/lib/utils";
import { useUiStore } from "@/shared/store/ui-store";
import type { Patient } from "@/shared/types";
import { CalendarPlus, FileText, Pencil } from "lucide-react";

interface PatientHeaderProps {
  patient: Patient;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const openQuickAppointmentForm = useUiStore((s) => s.openQuickAppointmentForm);

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      <div className="flex items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{patient.name}</h1>
            <Badge variant="secondary">{patient.gender}</Badge>
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
            {patient.chart_number && <span>#{patient.chart_number}</span>}
            <span>{formatDate(patient.birth_date)}</span>
            {patient.phone && <span>{formatPhone(patient.phone)}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/patients/${patient.id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            수정
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={() => openQuickAppointmentForm()}>
          <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
          새 예약
        </Button>
        <Link href={`/medical-records/new?patientId=${patient.id}`}>
          <Button variant="outline" size="sm">
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            새 진료
          </Button>
        </Link>
      </div>
    </div>
  );
}
