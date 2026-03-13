"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

const tabs = [
  { href: "/", label: "Dashboard" },
  { href: "/patients", label: "Patients" },
  { href: "/appointments", label: "Appointments" },
  { href: "/billing", label: "Billing" },
  { href: "/waiting", label: "Waiting" },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <div className="border-b bg-background">
      <div className="flex gap-0 overflow-x-auto px-4">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
