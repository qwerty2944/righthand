"use client";

import Link from "next/link";
import { useGetMedicalRecords } from "@/entities/medical-record";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from "@/shared/ui";
import { formatDate } from "@/shared/lib/utils";

interface PatientRecordsTabProps {
  patientId: string;
}

export function PatientRecordsTab({ patientId }: PatientRecordsTabProps) {
  const { data: records, isLoading } = useGetMedicalRecords(patientId);

  if (isLoading) return <div className="py-4 text-center text-sm text-muted-foreground">로딩중...</div>;

  if (!records || records.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">진료기록이 없습니다</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>날짜</TableHead>
          <TableHead>주증상</TableHead>
          <TableHead>상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell>
              <Link href={`/medical-records/${record.id}`} className="text-primary hover:underline">
                {formatDate(record.created_at)}
              </Link>
            </TableCell>
            <TableCell>{record.chief_complaint ?? "-"}</TableCell>
            <TableCell>
              <Badge variant={record.status === "finalized" ? "success" : "secondary"}>
                {record.status === "finalized" ? "확정" : record.status === "draft" ? "작성중" : record.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
