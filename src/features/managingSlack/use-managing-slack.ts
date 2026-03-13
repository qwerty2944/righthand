"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";
import type { InsertTables, UpdateTables } from "@/shared/types";

export function useGetSlackWorkspace() {
  const clinicId = useAuthStore((s) => s.clinicId);

  return useQuery({
    queryKey: ["slack-workspace", clinicId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("slack_workspaces")
        .select("*")
        .eq("clinic_id", clinicId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });
}

export function useGetBriefingSettings() {
  const clinicId = useAuthStore((s) => s.clinicId);

  return useQuery({
    queryKey: ["briefing-settings", clinicId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("briefing_settings")
        .select("*")
        .eq("clinic_id", clinicId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });
}

export function useUpdatingSlackWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: input }: { id: string; data: UpdateTables<"slack_workspaces"> }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("slack_workspaces")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slack-workspace"] });
    },
  });
}

export function useUpdatingBriefingSettings() {
  const queryClient = useQueryClient();
  const clinicId = useAuthStore((s) => s.clinicId);

  return useMutation({
    mutationFn: async (input: Omit<InsertTables<"briefing_settings">, "id" | "clinic_id" | "created_at" | "updated_at">) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("briefing_settings")
        .upsert({ ...input, clinic_id: clinicId! }, { onConflict: "clinic_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefing-settings"] });
    },
  });
}
