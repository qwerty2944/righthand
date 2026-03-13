"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";
import type { PaginationParams } from "@/shared/types";

export function useGetBillingItems(params?: PaginationParams & { status?: string; patientId?: string }) {
  const clinicId = useAuthStore((s) => s.clinicId);

  return useQuery({
    queryKey: ["billing-items", clinicId, params],
    queryFn: async () => {
      const supabase = createClient();
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("billing_items")
        .select("*, patient:patients(*)", { count: "exact" })
        .eq("clinic_id", clinicId!)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (params?.status) query = query.eq("status", params.status);
      if (params?.patientId) query = query.eq("patient_id", params.patientId);

      const { data, error, count } = await query;
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
