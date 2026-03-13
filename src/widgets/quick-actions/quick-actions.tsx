"use client";

import { useRouter } from "next/navigation";
import { UserPlus, CalendarPlus, FileText, Search } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";
import { useUiStore } from "@/shared/store/ui-store";

export function QuickActions() {
  const router = useRouter();
  const openQuickPatientForm = useUiStore((s) => s.openQuickPatientForm);
  const openQuickAppointmentForm = useUiStore((s) => s.openQuickAppointmentForm);
  const openSearchModal = useUiStore((s) => s.openSearchModal);

  const actions = [
    {
      label: "새 환자",
      icon: UserPlus,
      color: "text-blue-600 bg-blue-50",
      onClick: () => openQuickPatientForm(),
    },
    {
      label: "새 예약",
      icon: CalendarPlus,
      color: "text-green-600 bg-green-50",
      onClick: () => openQuickAppointmentForm(),
    },
    {
      label: "새 진료기록",
      icon: FileText,
      color: "text-purple-600 bg-purple-50",
      onClick: () => router.push("/medical-records/new"),
    },
    {
      label: "검색",
      icon: Search,
      color: "text-orange-600 bg-orange-50",
      onClick: () => openSearchModal(),
    },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-3">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className={`rounded-full p-2.5 ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
