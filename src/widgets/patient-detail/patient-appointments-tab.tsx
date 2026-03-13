"use client";

import Link from "next/link";
import { useGetAppointments } from "@/entities/appointment";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from "@/shared/ui";
import { formatDate } from "@/shared/lib/utils";

interface PatientAppointmentsTabProps {
  patientId: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }> = {
  scheduled: { label: "예약", variant: "secondary" },
  confirmed: { label: "확인", variant: "default" },
  in_progress: { label: "진료중", variant: "warning" },
  completed: { label: "완료", variant: "success" },
  cancelled: { label: "취소", variant: "destructive" },
  no_show: { label: "미방문", variant: "outline" },
};

export function PatientAppointmentsTab({ patientId }: PatientAppointmentsTabProps) {
  const { data, isLoading } = useGetAppointments({ patientId, limit: 50 });

  const appointments = data?.data ?? [];

  if (isLoading) return <div className="py-4 text-center text-sm text-muted-foreground">로딩중...</div>;

  if (appointments.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">예약 내역이 없습니다</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>날짜</TableHead>
          <TableHead>시간</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>메모</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((apt: Record<string, unknown>) => {
          const status = statusMap[(apt.status as string) ?? "scheduled"] ?? statusMap.scheduled;
          return (
            <TableRow key={apt.id as string}>
              <TableCell>
                <Link href={`/appointments/${apt.id}`} className="text-primary hover:underline">
                  {formatDate(apt.appointment_date as string)}
                </Link>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {(apt.start_time as string)?.slice(0, 5)}
              </TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {(apt.notes as string) ?? "-"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
