"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  HeartPulse,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { motion } from "framer-motion";

import { stagger } from "@/components/home/motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const floatingVitals = [
  { label: "SpO2", value: "96%", tone: "text-emerald-700" },
  { label: "Temperature", value: "37.6 C", tone: "text-sky-700" },
  { label: "Heart Rate", value: "88 bpm", tone: "text-blue-700" },
];

const heroBadges = ["Secure", "Fast", "Reliable"];

function MotionButton({
  href,
  children,
  variant = "default",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "outline";
}) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
      <Button
        asChild
        variant={variant}
        className={
          variant === "default"
            ? "h-12 rounded-full bg-blue-600 px-6 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
            : "h-12 rounded-full border-white/70 bg-white/80 px-6 text-slate-900 hover:bg-white"
        }
      >
        <Link href={href}>{children}</Link>
      </Button>
    </motion.div>
  );
}

export function HomeHero() {
  const { isAuthenticated, loading } = useAuth();

  const primaryHref = !loading && isAuthenticated ? "/dashboard/profile" : "/signup";
  const primaryLabel = !loading && isAuthenticated ? "Start Triage" : "Start Triage";
  const secondaryHref = !loading && isAuthenticated ? "/dashboard" : "#learn-more";

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-18">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_10%,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(20,184,166,0.18),transparent_24%),linear-gradient(135deg,rgba(239,248,255,1),rgba(244,251,255,1),rgba(240,253,250,1))]" />
      <div className="absolute left-1/2 top-[-12rem] -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute right-[-4rem] top-28 -z-10 h-60 w-60 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="absolute left-[-4rem] bottom-10 -z-10 h-60 w-60 rounded-full bg-sky-200/35 blur-3xl" />

      <div className="mx-auto grid w-full max-w-7xl gap-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <Badge className="mb-6 rounded-full border border-blue-100 bg-white/85 px-4 py-1.5 text-blue-700 shadow-sm backdrop-blur-sm">
              <ShieldCheck className="mr-2 size-3.5" />
              Hospital-grade intelligent triage support
            </Badge>
          </motion.div>

          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
            }}
            className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
          >
            AI-Powered Health Triage System
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
            className="mt-6 max-w-xl text-lg leading-8 text-slate-600"
          >
            Get instant medical guidance based on your symptoms and vitals through a
            modern, trustworthy platform designed for rapid assessment, calm decision
            support, and emergency-aware action.
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
            }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <MotionButton href={primaryHref}>
              {primaryLabel}
              {!loading && isAuthenticated ? (
                <LayoutDashboard className="size-4" />
              ) : (
                <ArrowRight className="size-4" />
              )}
            </MotionButton>
            <MotionButton href={secondaryHref} variant="outline">
              Learn More
            </MotionButton>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
            }}
            className="mt-8 flex flex-wrap gap-3"
          >
            {heroBadges.map((item) => (
              <div
                key={item}
                className="rounded-full border border-white/80 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm"
              >
                {item}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <motion.div
            className="absolute -left-6 top-10 hidden rounded-3xl border border-white/70 bg-white/70 p-4 shadow-xl backdrop-blur-sm lg:block"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <HeartPulse className="size-5" />
                <span className="absolute inset-0 rounded-2xl border border-blue-300/60 animate-ping" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Real-time triage</div>
                <div className="text-xs text-slate-500">Vitals interpreted instantly</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -right-4 bottom-8 hidden rounded-3xl border border-white/70 bg-white/75 p-4 shadow-xl backdrop-blur-sm lg:block"
            animate={{ y: [0, 9, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <MapPin className="size-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Nearby care</div>
                <div className="text-xs text-slate-500">Emergency pathways ready</div>
              </div>
            </div>
          </motion.div>

          <Card className="relative overflow-hidden rounded-[2rem] border-white/70 bg-white/72 shadow-[0_32px_80px_-36px_rgba(37,99,235,0.35)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(135deg,rgba(37,99,235,0.14),rgba(45,212,191,0.12),rgba(255,255,255,0))]" />
            <CardContent className="relative p-7 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    <Sparkles className="size-4" />
                    Live dashboard preview
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-slate-950">
                    Modern clinical overview
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-7 text-slate-600">
                    A visual triage summary showing current vitals, AI reasoning, and
                    emergency escalation readiness in one calming interface.
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 text-white shadow-lg shadow-blue-200">
                  <Stethoscope className="size-5" />
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {floatingVitals.map((item) => (
                  <motion.div
                    key={item.label}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className="rounded-3xl border border-slate-100 bg-white/90 p-4 shadow-sm"
                  >
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      {item.label}
                    </div>
                    <div className={`mt-2 text-xl font-semibold ${item.tone}`}>{item.value}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="rounded-[1.75rem] border border-blue-100 bg-[linear-gradient(135deg,rgba(239,246,255,1),rgba(255,255,255,1),rgba(240,253,250,0.96))] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-blue-700">AI summary</div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">
                        Moderate Risk
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Respiratory signals and fever pattern suggest a guided follow-up
                        path before final escalation.
                      </p>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                      <Activity className="size-5" />
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-blue-100/80 bg-white/85 px-4 py-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">Urgency progress</span>
                      <span className="font-semibold text-blue-700">68%</span>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-blue-100">
                      <div className="h-3 w-[68%] rounded-full bg-gradient-to-r from-blue-500 to-teal-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="rounded-[1.75rem] border border-emerald-100 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(240,253,250,0.96))] p-5"
                >
                  <div className="text-sm font-semibold text-emerald-700">
                    Emergency readiness
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      "Call emergency support if symptoms rapidly worsen",
                      "Surface nearby hospitals when risk becomes high",
                      "Track follow-up answers in session history",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
