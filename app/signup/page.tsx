import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your health triage account"
      description="Set up secure access to the platform and move directly into the authenticated dashboard after registration."
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="font-medium text-slate-900 hover:text-sky-700">
            Login
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
