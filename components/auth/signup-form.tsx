"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFirebaseAuthErrorMessage, signUpWithEmail } from "@/lib/auth";

export function SignupForm() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard/profile");
    }
  }, [isAuthenticated, loading, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signUpWithEmail(email.trim(), password);
      router.replace("/dashboard/profile");
    } catch (submitError) {
      setError(getFirebaseAuthErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full min-w-0 overflow-hidden rounded-3xl border-blue-100/90 bg-white/92 shadow-[0_28px_80px_-40px_rgba(37,99,235,0.45)]">
      <CardContent className="min-w-0 p-6 sm:p-7">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Create your account
          </h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
            Join to access your personalised health triage dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label
              htmlFor="full-name"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Full Name
            </Label>
            <Input
              id="full-name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              disabled={isSubmitting}
              className="h-11 rounded-xl border-blue-100 bg-white px-4 text-sm shadow-[0_8px_24px_-20px_rgba(15,23,42,0.6)] focus-visible:border-blue-400"
            />
          </div>

          <div>
            <Label
              htmlFor="signup-email"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Email
            </Label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              className="h-11 rounded-xl border-blue-100 bg-white px-4 text-sm shadow-[0_8px_24px_-20px_rgba(15,23,42,0.6)] focus-visible:border-blue-400"
            />
          </div>

          <div>
            <Label
              htmlFor="signup-password"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
                className="h-11 rounded-xl border-blue-100 bg-white px-4 pr-11 text-sm shadow-[0_8px_24px_-20px_rgba(15,23,42,0.6)] focus-visible:border-blue-400"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
                onClick={() => setShowPassword((current) => !current)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label
              htmlFor="confirm-password"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isSubmitting}
                className="h-11 rounded-xl border-blue-100 bg-white px-4 pr-11 text-sm shadow-[0_8px_24px_-20px_rgba(15,23,42,0.6)] focus-visible:border-blue-400"
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
                onClick={() => setShowConfirmPassword((current) => !current)}
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            className="mt-3 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
