"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label } from "@/shared/ui";
import { useUiStore } from "@/shared/store/ui-store";
import { useCreatingAppointment } from "@/features/creatingAppointment";
import { useGetPatients } from "@/entities/patient";

export function QuickAppointmentForm() {
  const open = useUiStore((s) => s.quickAppointmentFormOpen);
  const close = useUiStore((s) => s.closeQuickAppointmentForm);
  const router = useRouter();
  const { mutate, isPending } = useCreatingAppointment();
  const { data: patientsData } = useGetPatients({ limit: 100 });

  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");

  const patients = patientsData?.data ?? [];

  const reset = () => {
    setPatientId("");
    setDate(new Date().toISOString().split("T")[0]);
    setStartTime("09:00");
    setEndTime("09:30");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      {
        patient_id: patientId,
        appointment_date: date,
        start_time: startTime,
        end_time: endTime,
        status: "scheduled",
      },
      {
        onSuccess: (data) => {
          reset();
          close();
          router.push(`/appointments/${data.id}`);
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={close} size="sm">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>간편 예약 등록</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="qa-patient">환자 *</Label>
            <select
              id="qa-patient"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">환자 선택...</option>
              {patients.map((p: Record<string, unknown>) => (
                <option key={p.id as string} value={p.id as string}>
                  {p.name as string} {p.chart_number ? `(#${p.chart_number})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="qa-date">예약일 *</Label>
            <Input id="qa-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="qa-start">시작 시간</Label>
              <Input id="qa-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="qa-end">종료 시간</Label>
              <Input id="qa-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            취소
          </Button>
          <Button type="submit" disabled={isPending || !patientId || !date}>
            {isPending ? "등록중..." : "등록"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
