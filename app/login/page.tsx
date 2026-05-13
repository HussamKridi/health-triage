import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      variant="login"
      benefits={[
        {
          title: "Secure Access",
          description: "Your health data is always protected.",
          icon: "lock",
        },
        {
          title: "Personalised Care",
          description: "Get recommendations tailored for you.",
          icon: "care",
        },
        {
          title: "Fast & Easy",
          description: "Access your dashboard in seconds.",
          icon: "fast",
        },
      ]}
    >
      <LoginForm />
    </AuthShell>
  );
}
