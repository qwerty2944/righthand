"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useGetMedicalRecords } from "@/entities/medical-record";
import {
  Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Badge, Loading,
} from "@/shared/ui";

const statusLabel: Record<string, string> = {
  draft: "작성중",
  finalized: "확정",
  amended: "수정됨",
};

export default function MedicalRecordsPage() {
  const [search, setSearch] = useState("");
  const { data: records, isLoading } = useGetMedicalRecords();

  if (isLoading) return <Loading className="py-20" />;

  const filtered = search
    ? (records ?? []).filter((r) =>
        r.chief_complaint?.toLowerCase().includes(search.toLowerCase()) ||
        r.assessment?.toLowerCase().includes(search.toLowerCase()),
      )
    : (records ?? []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">진료기록</h1>
        <Link href="/medical-records/new">
          <Button><Plus className="mr-2 h-4 w-4" />새 진료기록</Button>
        </Link>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="주증상/진단으로 검색..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>날짜</TableHead>
            <TableHead>주증상 (C/C)</TableHead>
            <TableHead>진단 (A)</TableHead>
            <TableHead>상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.created_at?.slice(0, 10)}</TableCell>
              <TableCell>
                <Link href={`/medical-records/${record.id}`} className="font-medium text-primary hover:underline">
                  {record.chief_complaint || "-"}
                </Link>
              </TableCell>
              <TableCell>{record.assessment || "-"}</TableCell>
              <TableCell>
                <Badge variant={record.status === "finalized" ? "default" : "secondary"}>
                  {statusLabel[record.status] ?? record.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                진료기록이 없습니다
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
