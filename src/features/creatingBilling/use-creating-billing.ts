"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";
import type { InsertTables } from "@/shared/types";

type CreateBillingInput = Omit<InsertTables<"billing_items">, "id" | "clinic_id" | "created_by" | "created_at" | "updated_at">;

export function useCreatingBilling() {
  const queryClient = useQueryClient();
  const clinicId = useAuthStore((s) => s.clinicId);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (input: CreateBillingInput) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("billing_items")
        .insert({ ...input, clinic_id: clinicId!, created_by: user!.id })
        .select("*, patient:patients(*)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
