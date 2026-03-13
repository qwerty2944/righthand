"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";

export function useGetMedicalRecord(id: string | undefined) {
  return useQuery({
    queryKey: ["medical-record", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("medical_records")
        .select("*, files:medical_files(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
