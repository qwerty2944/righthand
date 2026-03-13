"use client";

import { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
} from "@/shared/ui";
import { useCreatingInvitation } from "@/features/creatingInvitation";

interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
}

export function InviteMemberDialog({ open, onClose }: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "owner">("staff");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const createInvitation = useCreatingInvitation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createInvitation.mutateAsync({
        email: email || undefined,
        role,
      });

      if (result?.code) {
        setGeneratedCode(result.code);
      }
    } catch (error) {
      console.error("Failed to create invitation:", error);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("staff");
    setGeneratedCode(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader>
        <DialogTitle>멤버 초대</DialogTitle>
      </DialogHeader>

      {generatedCode ? (
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted p-4">
            <p className="mb-2 text-sm text-muted-foreground">생성된 초대 코드:</p>
            <code className="block text-lg font-mono font-semibold">{generatedCode}</code>
          </div>
          <Button onClick={handleCopyCode} className="w-full">
            복사
          </Button>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              닫기
            </Button>
          </DialogFooter>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">이메일 (선택)</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>역할</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={role === "staff" ? "default" : "outline"}
                onClick={() => setRole("staff")}
                className="flex-1"
              >
                직원
              </Button>
              <Button
                type="button"
                variant={role === "owner" ? "default" : "outline"}
                onClick={() => setRole("owner")}
                className="flex-1"
              >
                원장
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createInvitation.isPending}>
              {createInvitation.isPending ? "생성 중..." : "초대하기"}
            </Button>
          </DialogFooter>
        </form>
      )}
    </Dialog>
  );
}
