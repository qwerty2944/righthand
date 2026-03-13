"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetPatients } from "@/entities/patient";
import { useCreatingBilling } from "@/features/creatingBilling";
import { Button, Input, Label, Select, Textarea, Card, CardHeader, CardTitle, CardContent } from "@/shared/ui";

const billingSchema = z.object({
  patient_id: z.string().min(1, "Select a patient"),
  billing_code: z.string().min(1, "Billing code is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0),
  quantity: z.number().int().min(1),
});

type BillingFormData = z.infer<typeof billingSchema>;

export default function NewBillingPage() {
  const router = useRouter();
  const createBilling = useCreatingBilling();
  const { data: patients } = useGetPatients({ limit: 100 });
  const { register, handleSubmit, formState: { errors } } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: { quantity: 1, amount: 0 },
  });

  const onSubmit = async (data: BillingFormData) => {
    await createBilling.mutateAsync(data);
    router.push("/billing");
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>New Billing Item</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Patient *</Label>
            <Select options={(patients?.data ?? []).map((p) => ({ value: p.id, label: p.name }))} placeholder="Select patient" {...register("patient_id")} />
            {errors.patient_id && <p className="text-sm text-red-500">{errors.patient_id.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Billing Code *</Label><Input {...register("billing_code")} placeholder="AA157" />{errors.billing_code && <p className="text-sm text-red-500">{errors.billing_code.message}</p>}</div>
            <div className="space-y-2"><Label>Amount *</Label><Input type="number" {...register("amount")} /></div>
          </div>
          <div className="space-y-2"><Label>Quantity</Label><Input type="number" {...register("quantity")} className="max-w-[100px]" /></div>
          <div className="space-y-2"><Label>Description *</Label><Textarea {...register("description")} />{errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}</div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={createBilling.isPending}>{createBilling.isPending ? "Creating..." : "Create"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
