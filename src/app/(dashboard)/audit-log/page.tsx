"use client";

import { useState } from "react";
import { useGetAuditLog } from "@/entities/audit-log";
import { Badge, Loading, Pagination, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/shared/ui";
import { formatDate, truncateId } from "@/shared/lib/utils";

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAuditLog({ page, limit: 50 });

  if (isLoading) return <Loading className="py-20" />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit Log</h1>
      <Table>
        <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Action</TableHead><TableHead>Resource</TableHead><TableHead>Resource ID</TableHead></TableRow></TableHeader>
        <TableBody>
          {data?.data.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">{formatDate(log.created_at, "yyyy-MM-dd HH:mm:ss")}</TableCell>
              <TableCell><Badge>{log.action}</Badge></TableCell>
              <TableCell>{log.resource_type}</TableCell>
              <TableCell className="font-mono text-xs">{truncateId(log.resource_id)}</TableCell>
            </TableRow>
          ))}
          {data?.data.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No audit logs</TableCell></TableRow>}
        </TableBody>
      </Table>
      {data?.meta && data.meta.totalPages > 1 && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
