"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Users, Calendar, Receipt } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, Input, Loading } from "@/shared/ui";
import { useUiStore } from "@/shared/store/ui-store";
import { useSearchingRecords } from "@/features/searchingRecords";

const iconMap: Record<string, typeof Users> = {
  patients: Users,
  appointments: Calendar,
  billing_items: Receipt,
  medical_records: FileText,
};

export function SearchModal() {
  const router = useRouter();
  const open = useUiStore((s) => s.searchModalOpen);
  const close = useUiStore((s) => s.closeSearchModal);
  const [query, setQuery] = useState("");
  const searchMutation = useSearchingRecords();

  const handleSearch = () => {
    if (query.length >= 2) {
      searchMutation.mutate(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSelect = (result: { id: string; source_table: string }) => {
    close();
    setQuery("");
    const routes: Record<string, string> = {
      patients: `/patients/${result.id}`,
      appointments: `/appointments/${result.id}`,
      billing_items: `/billing/${result.id}`,
      medical_records: `/patients`,
    };
    router.push(routes[result.source_table] ?? "/");
  };

  return (
    <Dialog open={open} onClose={() => { close(); setQuery(""); }} size="lg">
      <DialogHeader>
        <DialogTitle>Search</DialogTitle>
      </DialogHeader>
      <div className="mt-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patients, appointments, billing..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        {searchMutation.isPending && <Loading className="py-4" />}
        {searchMutation.data && (
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {searchMutation.data.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No results found</p>
            ) : (
              searchMutation.data.map((result) => {
                const Icon = iconMap[result.source_table] ?? FileText;
                return (
                  <button
                    key={`${result.source_table}-${result.id}`}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => handleSelect(result)}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 truncate">
                      <span className="font-medium">{result.content}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(result.similarity * 100)}%
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}
