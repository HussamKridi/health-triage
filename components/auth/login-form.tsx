"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getFirebaseAuthDiagnosticMessage,
  getFirebaseAuthErrorMessage,
  getFirebasePasswordResetErrorMessage,
  getFirebaseAuthTroubleshootingHint,
  logInWithEmail,
  sendUserPasswordReset,
} from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [debugHint, setDebugHint] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard/profile");
    }
  }, [isAuthenticated, loading, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setDebugHint("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await logInWithEmail(email.trim(), password);
      router.replace("/dashboard/profile");
    } catch (submitError) {
      setError(getFirebaseAuthErrorMessage(submitError));
      setDebugHint(getFirebaseAuthTroubleshootingHint(submitError));

      if (process.env.NODE_ENV !== "production") {
        console.error("[auth] Login failed", {
          diagnostic: getFirebaseAuthDiagnosticMessage(submitError),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setDebugHint("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address before requesting a reset link.");
      emailInputRef.current?.focus();
      return;
    }

    setIsSendingReset(true);

    try {
      await sendUserPasswordReset(email.trim());
      setSuccess("Password reset email sent. Please check your inbox.");
    } catch (resetError) {
      setError(getFirebasePasswordResetErrorMessage(resetError));
      setDebugHint(getFirebaseAuthTroubleshootingHint(resetError));

      if (process.env.NODE_ENV !== "production") {
        console.error("[auth] Password reset failed", {
          diagnostic: getFirebaseAuthDiagnosticMessage(resetError),
        });
      }
    } finally {
      setIsSendingReset(false);
    }
  }

  return (
    <Card className="w-full min-w-0 overflow-hidden rounded-3xl border-blue-100/90 bg-white/92 shadow-[0_28px_80px_-40px_rgba(37,99,235,0.45)]">
      <CardContent className="min-w-0 p-6 sm:p-8">
        <div className="mb-7">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Welcome back
          </h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
            Sign in to continue your health journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2 block text-xs font-semibold text-slate-700">
              Email
            </Label>
            <Input
              ref={emailInputRef}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting || isSendingReset}
              className="h-12 rounded-xl border-blue-100 bg-white px-4 text-sm shadow-[0_8px_24px_-20px_rgba(15,23,42,0.6)] focus-visible:border-blue-400"
            />
          </div>

          <div>
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold text-slate-700"
              >
                Password
              </Label>
              <button
                type="button"
                className="shrink-0 pb-2 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                onClick={handleForgotPassword}
                disabled={isSubmitting || isSendingReset}
              >
                {isSendingReset ? "Sending..." : "Forgot password?"}
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
                className="h-12 rounded-xl border-blue-100 bg-white px-4 pr-11 text-sm shadow-[0_8px_24px_-20px_rgba(15,23,42,0.6)] focus-visible:border-blue-400"
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

          <label className="flex w-fit items-center gap-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="size-4 rounded border-blue-100 text-blue-600 accent-blue-600"
            />
            Remember me
          </label>

          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
              {debugHint ? <div className="mt-2 text-xs text-red-600">{debugHint}</div> : null}
            </div>
          ) : null}

          <Button
            type="submit"
            className="mt-3 h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-7 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
