"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";
import type { InsertTables } from "@/shared/types";

type CreatePatientInput = Omit<InsertTables<"patients">, "id" | "clinic_id" | "created_at" | "updated_at">;

export function useCreatingPatient() {
  const queryClient = useQueryClient();
  const clinicId = useAuthStore((s) => s.clinicId);

  return useMutation({
    mutationFn: async (input: CreatePatientInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("patients")
        .insert({ ...input, clinic_id: clinicId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
