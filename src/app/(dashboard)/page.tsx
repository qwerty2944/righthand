"use client";

import { StatsCards } from "@/widgets/stats-cards";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";
import { Loading } from "@/shared/ui";

export default function DashboardPage() {
  const clinicId = useAuthStore((s) => s.clinicId);
  const supabase = createClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", clinicId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      const [patients, appointments, billing, waitlist] = await Promise.all([
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId!)
          .is("deleted_at", null),
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId!)
          .eq("appointment_date", today),
        supabase
          .from("billing_items")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId!)
          .in("status", ["draft", "confirmed"]),
        supabase
          .from("waitlist")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId!)
          .eq("status", "waiting"),
      ]);

      return {
        totalPatients: patients.count ?? 0,
        todayAppointments: appointments.count ?? 0,
        pendingBilling: billing.count ?? 0,
        waitingCount: waitlist.count ?? 0,
      };
    },
    enabled: !!clinicId,
  });

  if (isLoading) return <Loading className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <StatsCards
        stats={stats ?? { totalPatients: 0, todayAppointments: 0, pendingBilling: 0, waitingCount: 0 }}
      />
    </div>
  );
}
