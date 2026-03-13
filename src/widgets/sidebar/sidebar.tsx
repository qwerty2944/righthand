"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Calendar,
  Receipt,
  Clock,
  FileText,
  Settings,
  LayoutDashboard,
  UserPlus,
  CalendarPlus,
  LogOut,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useUiStore } from "@/shared/store/ui-store";
import { useAuthStore } from "@/shared/store/auth-store";
import { useSidebarCounts } from "./use-sidebar-counts";

type CountKey = "patients" | "todayAppointments" | "pendingBilling" | "waitingCount";

const navItems: { href: string; label: string; icon: typeof LayoutDashboard; countKey?: CountKey }[] = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/patients", label: "환자 관리", icon: Users, countKey: "patients" },
  { href: "/appointments", label: "예약 관리", icon: Calendar, countKey: "todayAppointments" },
  { href: "/medical-records", label: "진료기록", icon: FileText },
  { href: "/billing", label: "수납", icon: Receipt, countKey: "pendingBilling" },
  { href: "/waiting", label: "대기실", icon: Clock, countKey: "waitingCount" },
  { href: "/settings", label: "설정", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const openQuickPatientForm = useUiStore((s) => s.openQuickPatientForm);
  const openQuickAppointmentForm = useUiStore((s) => s.openQuickAppointmentForm);
  const logout = useAuthStore((s) => s.logout);
  const counts = useSidebarCounts();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-sidebar transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-16 items-center justify-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          {sidebarOpen && (
            <span className="text-lg font-bold text-primary">RightHand</span>
          )}
        </Link>
      </div>
      <nav className="mt-4 flex flex-1 flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const count = item.countKey && counts ? counts[item.countKey] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-active text-sidebar-active-text"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.countKey && count > 0 && (
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}>
                      {count}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-2">
        {sidebarOpen ? (
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>로그아웃</span>
          </button>
        ) : (
          <button
            onClick={logout}
            className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
            title="로그아웃"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="border-t p-2">
        {sidebarOpen ? (
          <div className="flex gap-2">
            <button
              onClick={openQuickPatientForm}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <UserPlus className="h-3.5 w-3.5" />
              새 환자
            </button>
            <button
              onClick={openQuickAppointmentForm}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              새 예약
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <button
              onClick={openQuickPatientForm}
              className="flex items-center justify-center rounded-lg bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90"
              title="새 환자"
            >
              <UserPlus className="h-4 w-4" />
            </button>
            <button
              onClick={openQuickAppointmentForm}
              className="flex items-center justify-center rounded-lg border p-2 transition-colors hover:bg-accent"
              title="새 예약"
            >
              <CalendarPlus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
