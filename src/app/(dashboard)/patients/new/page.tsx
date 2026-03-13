"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatingPatient } from "@/features/creatingPatient";
import { Button, Input, Label, Select, Textarea, Card, CardHeader, CardTitle, CardContent } from "@/shared/ui";

const patientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birth_date: z.string().min(1, "Birth date is required"),
  gender: z.enum(["male", "female", "other"]),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  chart_number: z.string().optional(),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function NewPatientPage() {
  const router = useRouter();
  const createPatient = useCreatingPatient();
  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: { gender: "male" },
  });

  const onSubmit = async (data: PatientFormData) => {
    await createPatient.mutateAsync(data);
    router.push("/patients");
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>New Patient</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Chart Number</Label>
              <Input {...register("chart_number")} />
            </div>
            <div className="space-y-2">
              <Label>Birth Date *</Label>
              <Input type="date" {...register("birth_date")} />
              {errors.birth_date && <p className="text-sm text-red-500">{errors.birth_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
                {...register("gender")}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register("phone")} placeholder="010-0000-0000" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input {...register("address")} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea {...register("notes")} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={createPatient.isPending}>
              {createPatient.isPending ? "Creating..." : "Create Patient"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
