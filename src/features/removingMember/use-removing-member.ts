"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";

interface RemoveMemberInput {
  memberId: string;
  userId: string;
}

export function useRemovingMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, userId }: RemoveMemberInput) => {
      const supabase = createClient();

      // Step 1: Deactivate clinic member
      const { error: memberError } = await supabase
        .from("clinic_members")
        .update({ is_active: false })
        .eq("id", memberId);

      if (memberError) throw memberError;

      // Step 2: Clear clinic_id from user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ clinic_id: null })
        .eq("id", userId);

      if (profileError) throw profileError;

      return { memberId, userId };
    },
    onSuccess: () => {
      // Invalidate clinic members query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["clinic-members"] });
    },
  });
}
