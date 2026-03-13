"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";

export function useCancellingInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("clinic_invitations")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}
