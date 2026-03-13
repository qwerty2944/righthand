"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/api";
import type { SearchResult } from "@/shared/types";

export function useGetSearchResults(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const { data } = await api.post<SearchResult[]>("/search", { query });
      return data;
    },
    enabled: query.length >= 2,
  });
}
