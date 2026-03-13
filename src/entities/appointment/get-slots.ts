"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";

export function useGetSlots(date?: string) {
  const clinicId = useAuthStore((s) => s.clinicId);

  return useQuery({
    queryKey: ["slots", clinicId, date],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("appointment_slots")
        .select("*")
        .eq("clinic_id", clinicId!)
        .eq("is_available", true)
        .order("start_time", { ascending: true });

      if (date) query = query.eq("slot_date", date);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!clinicId,
  });
}
