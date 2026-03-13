"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";

export function useGetAppointment(id: string | undefined) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("appointments")
        .select("*, patient:patients(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
