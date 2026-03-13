"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";

export function useGetPatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
