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

export default function BillingPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetBillingItems({ page, limit: 20 });
  const deleteBilling = useDeletingBilling();

  if (isLoading) return <Loading className="py-20" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing</h1>
        <Link href="/billing/new"><Button><Plus className="mr-2 h-4 w-4" />New Item</Button></Link>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Patient</TableHead><TableHead>Code</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {data?.data.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell>{formatDate(item.created_at)}</TableCell>
              <TableCell>{item.patient?.name ?? "-"}</TableCell>
              <TableCell className="font-mono">{item.billing_code}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell className="font-medium">{(item.amount * item.quantity).toLocaleString()}원</TableCell>
              <TableCell><Badge variant={statusColors[item.status] ?? "secondary"}>{item.status}</Badge></TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/billing/${item.id}/edit`}><Button variant="outline" size="sm">Edit</Button></Link>
                  {item.status === "draft" && <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete?")) deleteBilling.mutate(item.id); }}>Delete</Button>}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {data?.data.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No billing items</TableCell></TableRow>}
        </TableBody>
      </Table>
      {data?.meta && data.meta.totalPages > 1 && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
