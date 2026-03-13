"use client";

import { use } from "react";
import Link from "next/link";
import { useGetAppointment } from "@/entities/appointment";
import { useUpdatingAppointment } from "@/features/updatingAppointment";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Loading, Select } from "@/shared/ui";
import { formatDate } from "@/shared/lib/utils";

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "no_show", label: "No Show" },
];

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: appointment, isLoading } = useGetAppointment(id);
  const updateAppointment = useUpdatingAppointment();

  if (isLoading) return <Loading className="py-20" />;
  if (!appointment) return <div className="py-20 text-center text-muted-foreground">Not found</div>;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateAppointment.mutate({ id, data: { status: e.target.value as any } });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Appointment Details</h1>
        <Badge variant={appointment.status === "completed" ? "success" : appointment.status === "cancelled" ? "destructive" : "secondary"}>
          {appointment.status}
        </Badge>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">Info</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><Link href={`/patients/${appointment.patient_id}`} className="text-primary hover:underline">{(appointment as any).patient?.name ?? "-"}</Link></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{formatDate(appointment.appointment_date)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{appointment.start_time} - {appointment.end_time}</span></div>
          {appointment.notes && <div><span className="text-muted-foreground">Notes:</span><p className="mt-1">{appointment.notes}</p></div>}
          {appointment.cancel_reason && <div><span className="text-muted-foreground">Cancel Reason:</span><p className="mt-1 text-red-600">{appointment.cancel_reason}</p></div>}
        </CardContent>
      </Card>
      {appointment.status !== "cancelled" && appointment.status !== "completed" && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Update Status</CardTitle></CardHeader>
          <CardContent>
            <Select options={statusOptions} value={appointment.status} onChange={handleStatusChange} className="max-w-xs" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
