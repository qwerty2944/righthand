"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetPatient } from "@/entities/patient";
import { useUpdatingPatient } from "@/features/updatingPatient";
import { Button, Input, Label, Select, Textarea, Card, CardHeader, CardTitle, CardContent, Loading } from "@/shared/ui";

const patientSchema = z.object({
  name: z.string().min(1),
  birth_date: z.string().min(1),
  gender: z.enum(["male", "female", "other"]),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  chart_number: z.string().optional(),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: patient, isLoading } = useGetPatient(id);
  const updatePatient = useUpdatingPatient();

  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    values: patient ? {
      name: patient.name,
      birth_date: patient.birth_date,
      gender: patient.gender ?? "male",
      phone: patient.phone ?? "",
      email: patient.email ?? "",
      address: patient.address ?? "",
      chart_number: patient.chart_number ?? "",
      notes: patient.notes ?? "",
    } : undefined,
  });

  if (isLoading) return <Loading className="py-20" />;

  const onSubmit = async (data: PatientFormData) => {
    await updatePatient.mutateAsync({ id, data });
    router.push(`/patients/${id}`);
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Edit Patient</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Name *</Label><Input {...register("name")} />{errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Chart Number</Label><Input {...register("chart_number")} /></div>
            <div className="space-y-2"><Label>Birth Date *</Label><Input type="date" {...register("birth_date")} /></div>
            <div className="space-y-2"><Label>Gender</Label><Select options={[{value:"male",label:"Male"},{value:"female",label:"Female"},{value:"other",label:"Other"}]} {...register("gender")} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input {...register("phone")} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} /></div>
          </div>
          <div className="space-y-2"><Label>Address</Label><Input {...register("address")} /></div>
          <div className="space-y-2"><Label>Notes</Label><Textarea {...register("notes")} /></div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={updatePatient.isPending}>{updatePatient.isPending ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
