"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";

// @MX:NOTE: [AUTO] Fetches all clinic invitations for the current clinic
// @MX:SPEC: SPEC-INVITATION-001
export function useGetInvitations() {
  const clinicId = useAuthStore((s) => s.clinicId);

  return useQuery({
    queryKey: ["invitations", clinicId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clinic_invitations")
        .select("*")
        .eq("clinic_id", clinicId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });
}
