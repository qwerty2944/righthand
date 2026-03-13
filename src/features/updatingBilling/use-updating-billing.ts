"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import type { UpdateTables } from "@/shared/types";

export function useUpdatingBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: input }: { id: string; data: UpdateTables<"billing_items"> }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("billing_items")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*, patient:patients(*)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["billing-items"] });
    },
  });
}
