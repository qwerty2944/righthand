"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";

export function useGetWaitlist(status?: string) {
  const clinicId = useAuthStore((s) => s.clinicId);

  return useQuery({
    queryKey: ["waitlist", clinicId, status],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("waitlist")
        .select("*, patient:patients(*)")
        .eq("clinic_id", clinicId!)
        .order("desired_date", { ascending: true });

      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!clinicId,
  });
}
