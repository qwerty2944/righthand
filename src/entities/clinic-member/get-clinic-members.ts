"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";

export interface ClinicMemberWithProfile {
  id: string;
  user_id: string;
  clinic_id: string;
  role: "owner" | "staff";
  is_active: boolean;
  joined_at: string;
  name: string;
  email: string;
}

export function useGetClinicMembers() {
  const clinicId = useAuthStore((s) => s.clinicId);

  return useQuery({
    queryKey: ["clinic-members", clinicId],
    queryFn: async () => {
      const supabase = createClient();

      // Step 1: Fetch clinic members
      const { data: members, error: membersError } = await supabase
        .from("clinic_members")
        .select("id, user_id, clinic_id, role, is_active, joined_at")
        .eq("clinic_id", clinicId!)
        .eq("is_active", true)
        .order("joined_at", { ascending: true });

      if (membersError) throw membersError;
      if (!members || members.length === 0) return [];

      // Step 2: Fetch profiles for all user_ids
      const userIds = members.map((m) => m.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Step 3: Combine members with their profiles
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const combined: ClinicMemberWithProfile[] = members.map((member) => {
        const profile = profileMap.get(member.user_id);
        return {
          ...member,
          name: profile?.name || "Unknown",
          email: profile?.email || "",
        };
      });

      return combined;
    },
    enabled: !!clinicId,
  });
}
