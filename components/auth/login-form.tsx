"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getFirebaseAuthDiagnosticMessage,
  getFirebaseAuthErrorMessage,
  getFirebaseAuthTroubleshootingHint,
  logInWithEmail,
  sendUserPasswordReset,
} from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [debugHint, setDebugHint] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

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
      setError("Enter your email address first to receive a reset link.");
      return;
    }

    setIsSendingReset(true);

    try {
      await sendUserPasswordReset(email.trim());
      setSuccess("Password reset email sent. Please check your inbox.");
    } catch (resetError) {
      setError(getFirebaseAuthErrorMessage(resetError));
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
    <Card className="border-slate-200/80 shadow-[0_24px_60px_-28px_rgba(37,99,235,0.22)]">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              className="border-slate-300 bg-white px-4 py-3"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </Label>
              <button
                type="button"
                className="pb-2 text-sm font-medium text-sky-700 transition hover:text-sky-800"
                onClick={handleForgotPassword}
                disabled={isSubmitting || isSendingReset}
              >
                {isSendingReset ? "Sending reset..." : "Forgot password?"}
              </button>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              className="border-slate-300 bg-white px-4 py-3"
            />
          </div>

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
            className="mt-2 h-12 w-full rounded-xl text-sm shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-slate-900 hover:text-sky-700">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
