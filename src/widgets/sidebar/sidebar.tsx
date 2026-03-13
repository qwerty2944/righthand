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
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useUiStore } from "@/shared/store/ui-store";

const navItems = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/patients", label: "환자 관리", icon: Users },
  { href: "/appointments", label: "예약 관리", icon: Calendar },
  { href: "/medical-records", label: "진료기록", icon: FileText },
  { href: "/billing", label: "수납", icon: Receipt },
  { href: "/waiting", label: "대기실", icon: Clock },
  { href: "/settings", label: "설정", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300",
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
      <nav className="mt-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
