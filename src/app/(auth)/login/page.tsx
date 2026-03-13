import { LoginForm } from "./login-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">RightHand</CardTitle>
        <CardDescription>Hospital Management System</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
