import Link from "next/link";
import { Activity, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function AuthShell({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,rgba(248,250,252,1),rgba(255,255,255,1),rgba(240,249,255,0.72))] px-6 py-10 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-slate-900">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-teal-500 text-white shadow-lg shadow-sky-200/70">
              <Activity className="size-5" />
            </span>
            <span className="flex flex-col">
              <span>Health Triage</span>
              <span className="text-xs font-medium text-slate-500">Clinical decision support</span>
            </span>
          </Link>
        </div>

        <div className="grid overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_25px_80px_-36px_rgba(15,23,42,0.22)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden bg-[linear-gradient(160deg,rgba(2,132,199,0.08),rgba(255,255,255,0.95),rgba(13,148,136,0.08))] p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <Badge className="rounded-full px-4 py-1.5">
                <ShieldCheck className="mr-2 size-3.5" />
                Secure health-tech access
              </Badge>
              <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight text-slate-950">
                {title}
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
                {description}
              </p>
            </div>

            <div className="grid gap-4">
              {[
                "Guided access to triage sessions and clinical workflows",
                "Firebase Authentication for secure sign-in and registration",
                "A clean flow that connects directly to your dashboard experience",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm leading-6 text-slate-600 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 lg:hidden">
                <Badge className="rounded-full px-4 py-1.5">Secure health-tech access</Badge>
                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
                  {title}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              </div>

              {children}

              <div className="mt-8 text-sm text-slate-500">{footer}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
