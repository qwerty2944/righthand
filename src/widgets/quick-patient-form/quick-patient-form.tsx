"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label } from "@/shared/ui";
import { useUiStore } from "@/shared/store/ui-store";
import { useCreatingPatient } from "@/features/creatingPatient";

export function QuickPatientForm() {
  const open = useUiStore((s) => s.quickPatientFormOpen);
  const close = useUiStore((s) => s.closeQuickPatientForm);
  const router = useRouter();
  const { mutate, isPending } = useCreatingPatient();

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("male");
  const [phone, setPhone] = useState("");

  const reset = () => {
    setName("");
    setBirthDate("");
    setGender("male");
    setPhone("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      { name, birth_date: birthDate, gender: gender as "male" | "female" | "other", phone: phone || null },
      {
        onSuccess: (data) => {
          reset();
          close();
          router.push(`/patients/${data.id}`);
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={close} size="sm">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>간편 환자 등록</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="qp-name">이름 *</Label>
            <Input id="qp-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="환자 이름" />
          </div>
          <div>
            <Label htmlFor="qp-birth">생년월일 *</Label>
            <Input id="qp-birth" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="qp-gender">성별</Label>
            <select
              id="qp-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </select>
          </div>
          <div>
            <Label htmlFor="qp-phone">연락처</Label>
            <Input id="qp-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            취소
          </Button>
          <Button type="submit" disabled={isPending || !name || !birthDate}>
            {isPending ? "등록중..." : "등록"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
