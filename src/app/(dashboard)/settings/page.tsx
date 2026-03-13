"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { useGetClinic } from "@/entities/clinic";
import { Card, CardHeader, CardTitle, CardContent, Button, Loading } from "@/shared/ui";

export default function SettingsPage() {
  const { data: clinic, isLoading } = useGetClinic();

  if (isLoading) return <Loading className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Clinic Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{clinic?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Business #</span><span>{clinic?.business_number ?? "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{clinic?.phone ?? "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span>{clinic?.address ?? "-"}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Integrations</CardTitle></CardHeader>
          <CardContent>
            <Link href="/settings/slack"><Button variant="outline" className="w-full">Slack Settings</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              멤버 관리
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              병원 직원을 초대하고 관리합니다.
            </p>
            <Link href="/settings/members">
              <Button variant="outline" className="w-full">멤버 관리</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
