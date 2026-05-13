import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  Clock3,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
  ShieldPlus,
  Sparkles,
  Stethoscope,
} from "lucide-react";

type AuthShellVariant = "login" | "signup";

type Benefit = {
  title: string;
  description: string;
  icon: "lock" | "care" | "fast" | "clinical" | "always";
};

const benefitIcons = {
  lock: LockKeyhole,
  care: HeartPulse,
  fast: Clock3,
  clinical: BadgeCheck,
  always: ShieldCheck,
};

export function AuthShell({
  variant,
  benefits,
  children,
}: {
  variant: AuthShellVariant;
  benefits: Benefit[];
  children: ReactNode;
}) {
  const isLogin = variant === "login";
  const IllustrationIcon = isLogin ? Stethoscope : ShieldPlus;

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(219,234,254,0.72),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fbff_54%,#ffffff_100%)] px-4 py-5 [font-family:var(--font-geist-sans),Arial,sans-serif] text-slate-900 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="flex flex-col items-start gap-5">
          <Link href="/" className="inline-flex items-center gap-3 text-sm font-semibold text-slate-900">
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-lg shadow-blue-200/80">
              <Activity className="size-5" />
            </span>
            <span className="text-base">Health Triage</span>
          </Link>
          <Link
            href="/"
            aria-label="Back to homepage"
            className="inline-flex size-9 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-500 shadow-sm shadow-blue-100/70 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <ArrowLeft className="size-4" />
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-8 pt-5 lg:pt-0">
          <div className="grid items-center gap-5 lg:grid-cols-[0.9fr_1fr] lg:gap-16">
            <section className="flex w-full min-w-0 justify-center lg:justify-start" aria-hidden="true">
              <div className="relative h-52 w-full max-w-xs sm:h-80 sm:max-w-sm">
                <div className="absolute inset-x-6 bottom-3 h-12 rounded-[50%] bg-blue-100/80 blur-xl" />
                <div className="absolute left-1/2 top-1/2 flex size-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2rem] bg-gradient-to-br from-sky-100 via-blue-200 to-blue-400 text-white shadow-[0_24px_60px_-28px_rgba(37,99,235,0.7)] sm:size-52">
                  <IllustrationIcon className="size-20 stroke-[1.7] sm:size-28" />
                </div>
                <div className="absolute bottom-10 left-10 h-16 w-16 rounded-full bg-sky-100 sm:h-20 sm:w-20" />
                <div className="absolute bottom-8 left-20 h-8 w-24 rounded-t-full bg-blue-500/90 sm:h-10 sm:w-28" />
                <div className="absolute right-10 top-16 size-10 rounded-2xl bg-blue-50 shadow-inner" />
                {isLogin ? (
                  <div className="absolute bottom-16 left-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-lg shadow-rose-100 sm:bottom-20 sm:left-4 sm:size-16">
                    <HeartPulse className="size-8 sm:size-9" />
                  </div>
                ) : (
                  <div className="absolute bottom-16 left-4 h-16 w-8 rotate-[-32deg] rounded-full bg-sky-100 sm:bottom-20 sm:h-20 sm:w-10" />
                )}
                <Sparkles className="absolute right-5 bottom-20 size-8 text-blue-300" />
              </div>
            </section>

            <section className="flex w-full min-w-0 justify-center lg:justify-end">
              <div className="w-full min-w-0 max-w-sm sm:max-w-md">
                {children}
              </div>
            </section>
          </div>

          <section className="rounded-3xl border border-blue-100/90 bg-white/82 p-5 shadow-[0_24px_70px_-42px_rgba(37,99,235,0.35)] backdrop-blur sm:p-6">
            <div className="grid gap-5 md:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = benefitIcons[benefit.icon];

                return (
                  <div key={benefit.title} className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
                      <Icon className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">
                        {benefit.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-600">
                        {benefit.description}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
