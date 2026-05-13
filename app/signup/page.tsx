import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      variant="signup"
      benefits={[
        {
          title: "Secure & Private",
          description: "Your data is encrypted and protected.",
          icon: "lock",
        },
        {
          title: "Clinically Guided",
          description: "Built with healthcare best practices.",
          icon: "clinical",
        },
        {
          title: "Always Here",
          description: "Available whenever you need us.",
          icon: "always",
        },
      ]}
    >
      <SignupForm />
    </AuthShell>
  );
}
