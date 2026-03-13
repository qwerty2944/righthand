"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useUpdatingBilling } from "@/features/updatingBilling";
import { Button, Input, Label, Select, Textarea, Card, CardHeader, CardTitle, CardContent, Loading } from "@/shared/ui";

const billingSchema = z.object({
  billing_code: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().min(0),
  quantity: z.number().int().min(1),
  status: z.enum(["draft", "confirmed", "submitted", "paid"]),
});

type BillingFormData = z.infer<typeof billingSchema>;

export default function EditBillingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const updateBilling = useUpdatingBilling();

  const { data: item, isLoading } = useQuery({
    queryKey: ["billing-item", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("billing_items").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    values: item ? {
      billing_code: item.billing_code,
      description: item.description,
      amount: item.amount,
      quantity: item.quantity,
      status: item.status,
    } : undefined,
  });

  if (isLoading) return <Loading className="py-20" />;

  const onSubmit = async (data: BillingFormData) => {
    await updateBilling.mutateAsync({ id, data });
    router.push("/billing");
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Edit Billing Item</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Billing Code *</Label><Input {...register("billing_code")} /></div>
            <div className="space-y-2"><Label>Amount *</Label><Input type="number" {...register("amount")} /></div>
          </div>
          <div className="space-y-2"><Label>Quantity</Label><Input type="number" {...register("quantity")} className="max-w-[100px]" /></div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              options={[
                { value: "draft", label: "Draft" },
                { value: "confirmed", label: "Confirmed" },
                { value: "submitted", label: "Submitted" },
                { value: "paid", label: "Paid" },
              ]}
              {...register("status")}
            />
          </div>
          <div className="space-y-2"><Label>Description *</Label><Textarea {...register("description")} /></div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={updateBilling.isPending}>{updateBilling.isPending ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
