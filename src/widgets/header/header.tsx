"use client";

import { Menu, Search, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { DropdownMenu, DropdownMenuItem } from "@/shared/ui";
import { useUiStore } from "@/shared/store/ui-store";
import { useAuthStore } from "@/shared/store/auth-store";
import { createClient } from "@/shared/lib/supabase/client";

export function Header() {
  const router = useRouter();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const openSearchModal = useUiStore((s) => s.openSearchModal);
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          className="hidden w-64 justify-start text-muted-foreground md:flex"
          onClick={openSearchModal}
        >
          <Search className="mr-2 h-4 w-4" />
          Search... (Ctrl+K)
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu
          align="right"
          trigger={
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          }
        >
          <div className="px-2 py-1.5 text-sm font-medium">
            {user?.email}
          </div>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
