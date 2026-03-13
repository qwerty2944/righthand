"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";
import type { InsertTables } from "@/shared/types";

type JoinWaitlistInput = Omit<InsertTables<"waitlist">, "id" | "clinic_id" | "created_at" | "updated_at">;

export function useJoiningWaitlist() {
  const queryClient = useQueryClient();
  const clinicId = useAuthStore((s) => s.clinicId);

  return useMutation({
    mutationFn: async (input: JoinWaitlistInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("waitlist")
        .insert({ ...input, clinic_id: clinicId! })
        .select("*, patient:patients(*)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
