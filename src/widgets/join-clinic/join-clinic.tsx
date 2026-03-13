"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAcceptingInvitation } from "@/features/acceptingInvitation";
import { useAuthStore } from "@/shared/store/auth-store";
import { createClient } from "@/shared/lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
} from "@/shared/ui";

export function JoinClinic() {
  const [inviteCode, setInviteCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { mutate: acceptInvitation, isPending } = useAcceptingInvitation();
  const setClinicId = useAuthStore((s) => s.setClinicId);

  const handleJoin = () => {
    if (inviteCode.length !== 8) {
      setErrorMessage("초대 코드는 8자리입니다.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    acceptInvitation(
      { code: inviteCode },
      {
        onSuccess: (data) => {
          setSuccessMessage("병원에 성공적으로 합류했습니다!");
          // Update clinic_id in auth store
          if (data.clinic_id) {
            setClinicId(data.clinic_id);
          }
        },
        onError: (error: Error) => {
          setErrorMessage(error.message || "유효하지 않거나 만료된 초대 코드입니다.");
        },
      }
    );
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>병원에 합류하세요</CardTitle>
        <CardDescription>
          초대 코드를 입력하여 병원에 합류하거나, 새 병원을 등록하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {successMessage ? (
          <div className="text-green-600 font-medium">{successMessage}</div>
        ) : (
          <>
            <div className="space-y-2">
              <Input
                placeholder="초대 코드 (8자리)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                maxLength={8}
                disabled={isPending}
              />
              {errorMessage && (
                <div className="text-red-600 text-sm">{errorMessage}</div>
              )}
              <Button
                onClick={handleJoin}
                disabled={isPending || inviteCode.length !== 8}
                className="w-full"
              >
                {isPending ? "처리 중..." : "합류하기"}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground text-center">
              병원장이시라면 새 계정으로 가입해주세요.
            </div>
          </>
        )}

        <div className="pt-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
