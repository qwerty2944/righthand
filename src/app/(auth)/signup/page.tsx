"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui";
import { createClient } from "@/shared/lib/supabase/client";
import Link from "next/link";
import { User, Building2, UserPlus, ArrowLeft } from "lucide-react";

type SignupRole = "general" | "director" | "staff";

const baseSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

const directorSchema = baseSchema.extend({
  signup_role: z.literal("director"),
  clinic_name: z.string().min(1, "병원명을 입력해주세요"),
});

const staffSchema = baseSchema.extend({
  signup_role: z.literal("staff"),
  invite_code: z
    .string()
    .length(8, "초대 코드는 8자리여야 합니다")
    .regex(/^[A-Z0-9]{8}$/, "초대 코드는 대문자와 숫자로만 구성됩니다"),
});

const generalSchema = baseSchema.extend({
  signup_role: z.literal("general"),
});

const signupSchema = z.discriminatedUnion("signup_role", [
  directorSchema,
  staffSchema,
  generalSchema,
]);

type SignupFormData = z.infer<typeof signupSchema>;

const roleOptions = [
  {
    value: "general" as const,
    icon: User,
    title: "일반회원",
    description: "소속 없이 가입합니다",
  },
  {
    value: "director" as const,
    icon: Building2,
    title: "병원장",
    description: "새 병원을 등록합니다",
  },
  {
    value: "staff" as const,
    icon: UserPlus,
    title: "병원직원",
    description: "초대 코드로 합류합니다",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleRoleSelect = (role: SignupRole) => {
    setSelectedRole(role);
    setValue("signup_role", role);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedRole(null);
  };

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const metadata: {
      name: string;
      signup_role: SignupRole;
      clinic_name?: string;
      invite_code?: string;
    } = {
      name: data.name,
      signup_role: data.signup_role,
    };

    if (data.signup_role === "director") {
      metadata.clinic_name = data.clinic_name;
    } else if (data.signup_role === "staff") {
      metadata.invite_code = data.invite_code;
    }

    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: metadata,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">RightHand</CardTitle>
        <CardDescription>
          {step === 1 ? "회원 유형을 선택해주세요" : "회원가입 정보 입력"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <div className="space-y-3">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleRoleSelect(option.value)}
                  className="w-full flex items-start gap-4 p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors text-left"
                >
                  <Icon className="w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">{option.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>뒤로가기</span>
            </button>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" placeholder="홍길동" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@hospital.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="최소 6자 이상"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {selectedRole === "director" && (
              <div className="space-y-2">
                <Label htmlFor="clinic_name">병원명</Label>
                <Input
                  id="clinic_name"
                  placeholder="병원 이름을 입력해주세요"
                  {...register("clinic_name")}
                />
                {"clinic_name" in errors && errors.clinic_name && (
                  <p className="text-sm text-red-500">
                    {errors.clinic_name.message}
                  </p>
                )}
              </div>
            )}

            {selectedRole === "staff" && (
              <div className="space-y-2">
                <Label htmlFor="invite_code">초대 코드</Label>
                <Input
                  id="invite_code"
                  placeholder="8자리 초대 코드"
                  maxLength={8}
                  {...register("invite_code")}
                />
                {"invite_code" in errors && errors.invite_code && (
                  <p className="text-sm text-red-500">
                    {errors.invite_code.message}
                  </p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "가입 처리 중..." : "회원가입"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-primary underline">
                로그인
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
