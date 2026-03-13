"use client";

import { use } from "react";
import Link from "next/link";
import { useGetPatient } from "@/entities/patient";
import { useGetMedicalRecords } from "@/entities/medical-record";
import { useGetAppointments } from "@/entities/appointment";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Loading, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/shared/ui";
import { formatDate, formatPhone } from "@/shared/lib/utils";

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: patient, isLoading } = useGetPatient(id);
  const { data: records } = useGetMedicalRecords(id);
  const { data: appointments } = useGetAppointments({ patientId: id, limit: 5 });

  if (isLoading) return <Loading className="py-20" />;
  if (!patient) return <div className="py-20 text-center text-muted-foreground">Patient not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{patient.name}</h1>
        <Link href={`/patients/${id}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Patient Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Chart #</span><span>{patient.chart_number ?? "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Birth Date</span><span>{formatDate(patient.birth_date)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Gender</span><Badge variant="secondary">{patient.gender}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{patient.phone ? formatPhone(patient.phone) : "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{patient.email ?? "-"}</span></div>
            {patient.address && <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span>{patient.address}</span></div>}
            {patient.notes && <div><span className="text-muted-foreground">Notes:</span><p className="mt-1">{patient.notes}</p></div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Appointments</CardTitle></CardHeader>
          <CardContent>
            {appointments?.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments</p>
            ) : (
              <div className="space-y-2">
                {appointments?.data.map((apt: any) => (
                  <div key={apt.id} className="flex items-center justify-between rounded border p-2 text-sm">
                    <span>{formatDate(apt.appointment_date)} {apt.start_time}</span>
                    <Badge variant={apt.status === "completed" ? "success" : apt.status === "cancelled" ? "destructive" : "secondary"}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">Medical Records</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Chief Complaint</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.created_at)}</TableCell>
                  <TableCell>{record.chief_complaint ?? "-"}</TableCell>
                  <TableCell><Badge variant={record.status === "finalized" ? "success" : "secondary"}>{record.status}</Badge></TableCell>
                </TableRow>
              ))}
              {(!records || records.length === 0) && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">No records</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
