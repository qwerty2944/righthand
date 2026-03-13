"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";

interface CreateInvitationInput {
  email?: string;
  role: "owner" | "staff";
}

// @MX:NOTE: [AUTO] Creates a new clinic invitation with auto-generated code
// @MX:SPEC: SPEC-INVITATION-001
// @MX:REASON: Generates 8-character alphanumeric code for invitation security
export function useCreatingInvitation() {
  const queryClient = useQueryClient();
  const clinicId = useAuthStore((s) => s.clinicId);

  return useMutation({
    mutationFn: async (input: CreateInvitationInput) => {
      const supabase = createClient();

      // @MX:NOTE: Generate 8-character alphanumeric code
      const code = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

      // @MX:NOTE: Get current user as inviter
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("User not authenticated");

      // @MX:NOTE: Insert invitation record
      const { data, error } = await supabase
        .from("clinic_invitations")
        .insert({
          clinic_id: clinicId!,
          invited_by: user.id,
          email: input.email,
          code,
          role: input.role,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}
