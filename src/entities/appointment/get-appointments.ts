"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";

interface GetAppointmentsParams {
  date?: string;
  patientId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useGetAppointments(params?: GetAppointmentsParams) {
  const clinicId = useAuthStore((s) => s.clinicId);

  return useQuery({
    queryKey: ["appointments", clinicId, params],
    queryFn: async () => {
      const supabase = createClient();
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("appointments")
        .select("*, patient:patients(*)", { count: "exact" })
        .eq("clinic_id", clinicId!)
        .order("appointment_date", { ascending: true })
        .order("start_time", { ascending: true })
        .range(from, to);

      if (params?.date) query = query.eq("appointment_date", params.date);
      if (params?.patientId) query = query.eq("patient_id", params.patientId);
      if (params?.status) query = query.eq("status", params.status);

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
