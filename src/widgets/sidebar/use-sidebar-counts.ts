"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";

interface SidebarCounts {
  patients: number;
  todayAppointments: number;
  pendingBilling: number;
  waitingCount: number;
}

export function useSidebarCounts(): SidebarCounts | undefined {
  const clinicId = useAuthStore((s) => s.clinicId);

  const { data } = useQuery({
    queryKey: ["sidebar-counts", clinicId],
    queryFn: async () => {
      const supabase = createClient();
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
        patients: patients.count ?? 0,
        todayAppointments: appointments.count ?? 0,
        pendingBilling: billing.count ?? 0,
        waitingCount: waitlist.count ?? 0,
      };
    },
    enabled: !!clinicId,
    refetchInterval: 30000,
  });

  return data;
}
