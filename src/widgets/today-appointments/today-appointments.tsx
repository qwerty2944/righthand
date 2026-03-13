"use client";

import Link from "next/link";
import { useGetAppointments } from "@/entities/appointment";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/shared/ui";
import { formatDate } from "@/shared/lib/utils";
import { Clock } from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }> = {
  scheduled: { label: "예약", variant: "secondary" },
  confirmed: { label: "확인", variant: "default" },
  in_progress: { label: "진료중", variant: "warning" },
  completed: { label: "완료", variant: "success" },
  cancelled: { label: "취소", variant: "destructive" },
  no_show: { label: "미방문", variant: "outline" },
};

export function TodayAppointments() {
  const today = new Date().toISOString().split("T")[0];
  const { data, isLoading } = useGetAppointments({ date: today, limit: 50 });

  const appointments = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            오늘 예약
          </CardTitle>
          <Link href="/appointments" className="text-xs text-primary hover:underline">
            전체보기
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">로딩중...</div>
        ) : appointments.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">오늘 예약이 없습니다</div>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {appointments.map((apt: Record<string, unknown>) => {
              const config = statusConfig[(apt.status as string) ?? "scheduled"] ?? statusConfig.scheduled;
              const patient = apt.patient as Record<string, unknown> | null;
              return (
                <Link
                  key={apt.id as string}
                  href={`/appointments/${apt.id}`}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground w-12">
                      {(apt.start_time as string)?.slice(0, 5)}
                    </span>
                    <span className="font-medium">{(patient?.name as string) ?? "-"}</span>
                  </div>
                  <Badge variant={config.variant} className="text-[11px]">
                    {config.label}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
