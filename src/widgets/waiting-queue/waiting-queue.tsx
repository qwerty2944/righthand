"use client";

import Link from "next/link";
import { useGetWaitlist } from "@/entities/waitlist";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/shared/ui";
import { Users } from "lucide-react";

function formatElapsed(dateStr: string): string {
  const now = new Date();
  const created = new Date(dateStr);
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분`;
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return `${hours}시간 ${mins}분`;
}

export function WaitingQueue() {
  const { data: waitlist, isLoading } = useGetWaitlist("waiting");

  const entries = waitlist ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            대기 환자
          </CardTitle>
          <Link href="/waiting" className="text-xs text-primary hover:underline">
            전체보기
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">로딩중...</div>
        ) : entries.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">대기 환자가 없습니다</div>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {entries.map((entry: Record<string, unknown>, index: number) => {
              const patient = entry.patient as Record<string, unknown> | null;
              return (
                <div
                  key={entry.id as string}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs w-7 justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{(patient?.name as string) ?? "-"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatElapsed(entry.created_at as string)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
