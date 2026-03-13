"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";

interface AcceptInvitationInput {
  code: string;
}

// @MX:NOTE: [AUTO] Accepts a clinic invitation using the invitation code
// @MX:SPEC: SPEC-INVITATION-001
// @MX:WARN: Validates invitation expiration and updates multiple tables
// @MX:REASON: Complex multi-step transaction requires careful error handling
export function useAcceptingInvitation() {
  const queryClient = useQueryClient();
  const setClinicId = useAuthStore((s) => s.setClinicId);

  return useMutation({
    mutationFn: async (input: AcceptInvitationInput) => {
      const supabase = createClient();

      // @MX:NOTE: Step 1 - Look up the invitation
      const { data: invitation, error: invitationError } = await supabase
        .from("clinic_invitations")
        .select("*")
        .eq("code", input.code)
        .eq("status", "pending")
        .single();

      if (invitationError || !invitation) {
        throw new Error("Invitation not found or already used");
      }

      // @MX:NOTE: Step 2 - Check expiration
      const expiresAt = new Date(invitation.expires_at);
      if (expiresAt < new Date()) {
        throw new Error("Invitation has expired");
      }

      // @MX:NOTE: Step 3 - Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("User not authenticated");

      // @MX:NOTE: Step 4 - Insert into clinic_members
      const { error: memberError } = await supabase
        .from("clinic_members")
        .insert({
          user_id: user.id,
          clinic_id: invitation.clinic_id,
          role: invitation.role,
        });

      if (memberError) throw memberError;

      // @MX:NOTE: Step 5 - Update profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ clinic_id: invitation.clinic_id })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // @MX:NOTE: Step 6 - Mark invitation as accepted
      const { error: updateError } = await supabase
        .from("clinic_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id);

      if (updateError) throw updateError;

      return invitation;
    },
    onSuccess: (invitation) => {
      // @MX:NOTE: Update auth store with new clinic ID
      setClinicId(invitation.clinic_id);
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["clinic"] });
    },
  });
}
