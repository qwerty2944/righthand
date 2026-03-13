"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";

export function useGetClinic() {
  const clinicId = useAuthStore((s) => s.clinicId);

  return useQuery({
    queryKey: ["clinic", clinicId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", clinicId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });
}
