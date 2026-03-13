"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";
import type { PaginationParams } from "@/shared/types";

export function useGetAuditLog(params?: PaginationParams) {
  const clinicId = useAuthStore((s) => s.clinicId);

  return useQuery({
    queryKey: ["audit-log", clinicId, params],
    queryFn: async () => {
      const supabase = createClient();
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from("audit_log")
        .select("*", { count: "exact" })
        .eq("clinic_id", clinicId!)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        data: data ?? [],
        meta: {
          total: count ?? 0,
          page,
          limit,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      };
    },
    enabled: !!clinicId,
  });
}
