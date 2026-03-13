"use client";

import Link from "next/link";
import { useGetBillingItems } from "@/entities/billing";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from "@/shared/ui";
import { formatDate } from "@/shared/lib/utils";

interface PatientBillingTabProps {
  patientId: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }> = {
  draft: { label: "임시", variant: "secondary" },
  confirmed: { label: "확정", variant: "default" },
  submitted: { label: "청구", variant: "warning" },
  paid: { label: "수납완료", variant: "success" },
};

export function PatientBillingTab({ patientId }: PatientBillingTabProps) {
  const { data, isLoading } = useGetBillingItems({ patientId, limit: 50 });

  const items = data?.data ?? [];

  if (isLoading) return <div className="py-4 text-center text-sm text-muted-foreground">로딩중...</div>;

  if (items.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">수납 내역이 없습니다</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>날짜</TableHead>
          <TableHead>항목</TableHead>
          <TableHead className="text-right">금액</TableHead>
          <TableHead>상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item: Record<string, unknown>) => {
          const status = statusMap[(item.status as string) ?? "draft"] ?? statusMap.draft;
          return (
            <TableRow key={item.id as string}>
              <TableCell>
                <Link href={`/billing/${item.id}`} className="text-primary hover:underline">
                  {formatDate(item.created_at as string)}
                </Link>
              </TableCell>
              <TableCell>{(item.description as string) ?? "-"}</TableCell>
              <TableCell className="text-right font-mono">
                {((item.amount as number) ?? 0).toLocaleString()}원
              </TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
