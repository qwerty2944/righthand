"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useGetPatients } from "@/entities/patient";
import { useDeletingPatient } from "@/features/deletingPatient";
import {
  Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Badge, Loading, Pagination,
} from "@/shared/ui";
import { formatDate, formatPhone } from "@/shared/lib/utils";

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetPatients({ page, search, limit: 20 });
  const deletePatient = useDeletingPatient();

  if (isLoading) return <Loading className="py-20" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Link href="/patients/new">
          <Button><Plus className="mr-2 h-4 w-4" />New Patient</Button>
        </Link>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          className="pl-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chart #</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Birth Date</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>{patient.chart_number ?? "-"}</TableCell>
              <TableCell>
                <Link href={`/patients/${patient.id}`} className="font-medium text-primary hover:underline">
                  {patient.name}
                </Link>
              </TableCell>
              <TableCell>{formatDate(patient.birth_date)}</TableCell>
              <TableCell>
                <Badge variant="secondary">{patient.gender}</Badge>
              </TableCell>
              <TableCell>{patient.phone ? formatPhone(patient.phone) : "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/patients/${patient.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => { if (confirm("Delete this patient?")) deletePatient.mutate(patient.id); }}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {data?.data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No patients found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {data?.meta && data.meta.totalPages > 1 && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
