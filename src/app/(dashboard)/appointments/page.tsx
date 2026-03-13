"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { useGetAppointments } from "@/entities/appointment";
import { useCancellingAppointment } from "@/features/cancellingAppointment";
import { Button, Input, Badge, Loading, Pagination, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/shared/ui";
import { formatDate } from "@/shared/lib/utils";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  scheduled: "secondary", confirmed: "default", in_progress: "warning", completed: "success", cancelled: "destructive", no_show: "destructive",
};

export default function AppointmentsPage() {
  const [page, setPage] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { data, isLoading } = useGetAppointments({ date, page, limit: 20 });
  const cancelAppointment = useCancellingAppointment();

  if (isLoading) return <Loading className="py-20" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <Link href="/appointments/new"><Button><Plus className="mr-2 h-4 w-4" />New Appointment</Button></Link>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Input type="date" className="w-48" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} />
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Patient</TableHead><TableHead>Status</TableHead><TableHead>Notes</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {data?.data.map((apt: any) => (
            <TableRow key={apt.id}>
              <TableCell className="font-medium">{apt.start_time} - {apt.end_time}</TableCell>
              <TableCell><Link href={`/patients/${apt.patient_id}`} className="text-primary hover:underline">{apt.patient?.name ?? "-"}</Link></TableCell>
              <TableCell><Badge variant={statusColors[apt.status] ?? "secondary"}>{apt.status}</Badge></TableCell>
              <TableCell className="max-w-[200px] truncate">{apt.notes ?? "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/appointments/${apt.id}`}><Button variant="outline" size="sm">View</Button></Link>
                  {apt.status !== "cancelled" && apt.status !== "completed" && (
                    <Button variant="destructive" size="sm" onClick={() => { if (confirm("Cancel this appointment?")) cancelAppointment.mutate({ id: apt.id }); }}>Cancel</Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {data?.data.length === 0 && (<TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No appointments for this date</TableCell></TableRow>)}
        </TableBody>
      </Table>
      {data?.meta && data.meta.totalPages > 1 && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
