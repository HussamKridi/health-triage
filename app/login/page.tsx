import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to continue your triage workflow"
      description="Access the platform, review sessions, and continue from the homepage into the protected clinical workspace."
      footer={
        <>
          Need an account?{" "}
          <Link href="/signup" className="font-medium text-slate-900 hover:text-sky-700">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
