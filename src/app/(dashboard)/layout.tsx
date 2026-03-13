"use client";

import { useEffect } from "react";
import { Sidebar } from "@/widgets/sidebar";
import { QuickPatientForm } from "@/widgets/quick-patient-form";
import { QuickAppointmentForm } from "@/widgets/quick-appointment-form";
import { useUiStore } from "@/shared/store/ui-store";
import { useAuthStore } from "@/shared/store/auth-store";
import { createClient } from "@/shared/lib/supabase/client";
import { cn } from "@/shared/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const openSearchModal = useUiStore((s) => s.openSearchModal);
  const setUser = useAuthStore((s) => s.setUser);
  const setClinicId = useAuthStore((s) => s.setClinicId);
  const clinicId = useAuthStore((s) => s.clinicId);

  useEffect(() => {
    if (clinicId) return;
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser({ id: user.id, email: user.email });
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();
      if (profile) setClinicId(profile.clinic_id);
    };
    loadProfile();
  }, [clinicId, setUser, setClinicId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        openSearchModal();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openSearchModal]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16",
        )}
      >
        <main className="p-6">{children}</main>
      </div>
      <QuickPatientForm />
      <QuickAppointmentForm />
    </div>
  );
}
