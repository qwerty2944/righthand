"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Loading } from "@/shared/ui";
import { formatDate } from "@/shared/lib/utils";

export default function BillingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: item, isLoading } = useQuery({
    queryKey: ["billing-item", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("billing_items").select("*, patient:patients(*)").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <Loading className="py-20" />;
  if (!item) return <div className="py-20 text-center text-muted-foreground">Not found</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing Detail</h1>
        <Badge>{item.status}</Badge>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">Info</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span>{(item as any).patient?.name ?? "-"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Code</span><span className="font-mono">{item.billing_code}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Description</span><span>{item.description}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span>{item.amount.toLocaleString()}원 x {item.quantity}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold">{(item.amount * item.quantity).toLocaleString()}원</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{formatDate(item.created_at)}</span></div>
        </CardContent>
      </Card>
      <Button variant="outline" onClick={() => router.back()}>Back</Button>
    </div>
  );
}
