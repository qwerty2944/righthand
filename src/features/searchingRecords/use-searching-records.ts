"use client";

import { useMutation } from "@tanstack/react-query";
import api from "@/shared/lib/api";
import type { SearchResult } from "@/shared/types";

export function useSearchingRecords() {
  return useMutation({
    mutationFn: async (query: string) => {
      const { data } = await api.post<SearchResult[]>("/search", { query });
      return data;
    },
  });
}
