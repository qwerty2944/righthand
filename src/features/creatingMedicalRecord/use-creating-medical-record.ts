"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";
import type { InsertTables } from "@/shared/types";

type CreateMedicalRecordInput = Omit<InsertTables<"medical_records">, "id" | "clinic_id" | "created_at" | "updated_at">;

export function useCreatingMedicalRecord() {
  const queryClient = useQueryClient();
  const clinicId = useAuthStore((s) => s.clinicId);

  return useMutation({
    mutationFn: async (input: CreateMedicalRecordInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("medical_records")
        .insert({ ...input, clinic_id: clinicId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });
}
