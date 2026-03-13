"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetPatients } from "@/entities/patient";
import { useCreatingAppointment } from "@/features/creatingAppointment";
import { Button, Input, Label, Select, Textarea, Card, CardHeader, CardTitle, CardContent } from "@/shared/ui";

const appointmentSchema = z.object({
  patient_id: z.string().min(1, "Select a patient"),
  appointment_date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function NewAppointmentPage() {
  const router = useRouter();
  const createAppointment = useCreatingAppointment();
  const { data: patients } = useGetPatients({ limit: 100 });
  const { register, handleSubmit, formState: { errors } } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { appointment_date: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = async (data: AppointmentFormData) => {
    await createAppointment.mutateAsync(data);
    router.push("/appointments");
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>New Appointment</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Patient *</Label>
            <Select options={(patients?.data ?? []).map((p) => ({ value: p.id, label: p.name }))} placeholder="Select patient" {...register("patient_id")} />
            {errors.patient_id && <p className="text-sm text-red-500">{errors.patient_id.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Date *</Label><Input type="date" {...register("appointment_date")} />{errors.appointment_date && <p className="text-sm text-red-500">{errors.appointment_date.message}</p>}</div>
            <div className="space-y-2"><Label>Start Time *</Label><Input type="time" {...register("start_time")} /></div>
            <div className="space-y-2"><Label>End Time *</Label><Input type="time" {...register("end_time")} /></div>
          </div>
          <div className="space-y-2"><Label>Notes</Label><Textarea {...register("notes")} /></div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={createAppointment.isPending}>{createAppointment.isPending ? "Creating..." : "Create"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
