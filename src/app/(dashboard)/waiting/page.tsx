"use client";

import { useGetWaitlist } from "@/entities/waitlist";
import { Badge, Loading, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/shared/ui";
import { formatDate } from "@/shared/lib/utils";

export default function WaitingPage() {
  const { data, isLoading } = useGetWaitlist("waiting");

  if (isLoading) return <Loading className="py-20" />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Waiting List</h1>
      <Table>
        <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Desired Date</TableHead><TableHead>Time Range</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>
          {data?.map((entry: any) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.patient?.name ?? "-"}</TableCell>
              <TableCell>{formatDate(entry.desired_date)}</TableCell>
              <TableCell>{entry.desired_start && entry.desired_end ? `${entry.desired_start} - ${entry.desired_end}` : "Any"}</TableCell>
              <TableCell><Badge variant={entry.status === "waiting" ? "warning" : entry.status === "booked" ? "success" : "secondary"}>{entry.status}</Badge></TableCell>
            </TableRow>
          ))}
          {(!data || data.length === 0) && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No one waiting</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
}
