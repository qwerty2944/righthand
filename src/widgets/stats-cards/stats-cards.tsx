"use client";

import { Users, Calendar, Receipt, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";

interface StatsData {
  totalPatients: number;
  todayAppointments: number;
  pendingBilling: number;
  waitingCount: number;
}

export function StatsCards({ stats }: { stats: StatsData }) {
  const cards = [
    { title: "Total Patients", value: stats.totalPatients, icon: Users, color: "text-blue-600" },
    { title: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: "text-green-600" },
    { title: "Pending Billing", value: stats.pendingBilling, icon: Receipt, color: "text-yellow-600" },
    { title: "Waiting", value: stats.waitingCount, icon: Clock, color: "text-red-600" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
