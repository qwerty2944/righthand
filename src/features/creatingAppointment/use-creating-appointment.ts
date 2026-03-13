"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";
import type { InsertTables } from "@/shared/types";

type CreateAppointmentInput = Omit<InsertTables<"appointments">, "id" | "clinic_id" | "created_by" | "created_at" | "updated_at">;

export function useCreatingAppointment() {
  const queryClient = useQueryClient();
  const clinicId = useAuthStore((s) => s.clinicId);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (input: CreateAppointmentInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("appointments")
        .insert({ ...input, clinic_id: clinicId!, created_by: user!.id })
        .select("*, patient:patients(*)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
