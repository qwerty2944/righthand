"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";

export function useRealtime() {
  const queryClient = useQueryClient();
  const clinicId = useAuthStore((s) => s.clinicId);

  useEffect(() => {
    if (!clinicId) return;

    const supabase = createClient();

    const channel = supabase
      .channel("clinic-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments", filter: `clinic_id=eq.${clinicId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["appointments"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients", filter: `clinic_id=eq.${clinicId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["patients"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "waitlist", filter: `clinic_id=eq.${clinicId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["waitlist"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "billing_items", filter: `clinic_id=eq.${clinicId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["billing-items"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinicId, queryClient]);
}
