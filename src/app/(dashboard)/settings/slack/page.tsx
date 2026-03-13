"use client";

import { useForm } from "react-hook-form";
import {
  useGetSlackWorkspace,
  useGetBriefingSettings,
  useUpdatingBriefingSettings,
} from "@/features/managingSlack";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Loading } from "@/shared/ui";

export default function SlackSettingsPage() {
  const { data: workspace, isLoading: wsLoading } = useGetSlackWorkspace();
  const { data: briefing, isLoading: bsLoading } = useGetBriefingSettings();
  const updateBriefing = useUpdatingBriefingSettings();

  const { register, handleSubmit } = useForm({
    values: briefing ? {
      channel_id: briefing.channel_id,
      schedule_time: briefing.schedule_time,
      is_enabled: briefing.is_enabled,
      include_appointments: briefing.include_appointments,
      include_waitlist: briefing.include_waitlist,
      include_billing: briefing.include_billing,
    } : {
      channel_id: "",
      schedule_time: "08:00",
      is_enabled: false,
      include_appointments: true,
      include_waitlist: true,
      include_billing: false,
    },
  });

  if (wsLoading || bsLoading) return <Loading className="py-20" />;

  const onSubmit = (data: any) => {
    updateBriefing.mutate(data);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Slack Settings</h1>
      <Card>
        <CardHeader><CardTitle className="text-lg">Workspace</CardTitle></CardHeader>
        <CardContent>
          {workspace ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Team</span><span>{workspace.team_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{workspace.is_active ? "Active" : "Inactive"}</span></div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No Slack workspace connected</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-lg">Morning Briefing</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="enabled" {...register("is_enabled")} className="h-4 w-4" />
              <Label htmlFor="enabled">Enable daily briefing</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Channel ID</Label><Input {...register("channel_id")} placeholder="C01XXXXXXXX" /></div>
              <div className="space-y-2"><Label>Time</Label><Input type="time" {...register("schedule_time")} /></div>
            </div>
            <div className="space-y-2">
              <Label>Include in briefing:</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" {...register("include_appointments")} className="h-4 w-4" />Appointments</label>
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" {...register("include_waitlist")} className="h-4 w-4" />Waitlist</label>
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" {...register("include_billing")} className="h-4 w-4" />Billing</label>
              </div>
            </div>
            <Button type="submit" disabled={updateBriefing.isPending}>{updateBriefing.isPending ? "Saving..." : "Save Settings"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
