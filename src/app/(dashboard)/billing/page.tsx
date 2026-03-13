"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useGetBillingItems } from "@/entities/billing";
import { useDeletingBilling } from "@/features/deletingBilling";
import { Button, Badge, Loading, Pagination, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/shared/ui";
import { formatDate } from "@/shared/lib/utils";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  draft: "secondary", confirmed: "default", submitted: "warning", paid: "success",
};

const statusLabel: Record<string, string> = {
  draft: "작성중", confirmed: "확인됨", submitted: "청구됨", paid: "수납완료",
};

export default function BillingPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetBillingItems({ page, limit: 20 });
  const deleteBilling = useDeletingBilling();

  if (isLoading) return <Loading className="py-20" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">수납</h1>
        <Link href="/billing/new"><Button><Plus className="mr-2 h-4 w-4" />새 항목</Button></Link>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>날짜</TableHead><TableHead>환자</TableHead><TableHead>코드</TableHead><TableHead>설명</TableHead><TableHead>금액</TableHead><TableHead>상태</TableHead><TableHead>관리</TableHead></TableRow></TableHeader>
        <TableBody>
          {data?.data.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell>{formatDate(item.created_at)}</TableCell>
              <TableCell>{item.patient?.name ?? "-"}</TableCell>
              <TableCell className="font-mono">{item.billing_code}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell className="font-medium">{(item.amount * item.quantity).toLocaleString()}원</TableCell>
              <TableCell><Badge variant={statusColors[item.status] ?? "secondary"}>{statusLabel[item.status] ?? item.status}</Badge></TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/billing/${item.id}/edit`}><Button variant="outline" size="sm">수정</Button></Link>
                  {item.status === "draft" && <Button variant="destructive" size="sm" onClick={() => { if (confirm("삭제하시겠습니까?")) deleteBilling.mutate(item.id); }}>삭제</Button>}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {data?.data.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">수납 내역이 없습니다</TableCell></TableRow>}
        </TableBody>
      </Table>
      {data?.meta && data.meta.totalPages > 1 && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
