"use client";

import { BadgeCheck, ShieldCheck, Sparkles, TimerReset } from "lucide-react";
import { motion } from "framer-motion";

import { viewport } from "@/components/home/motion";

const items = [
  {
    icon: Sparkles,
    title: "Built with AI + Medical Logic",
    copy: "Combines intelligent follow-up with structured clinical reasoning.",
  },
  {
    icon: TimerReset,
    title: "Real-time decision support",
    copy: "Designed for faster patient triage without losing clarity.",
  },
  {
    icon: ShieldCheck,
    title: "Designed for patient safety",
    copy: "Conservative emergency pathways remain visible when risk increases.",
  },
];

export function TrustStrip() {
  return (
    <section id="learn-more" className="px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-blue-100/80 bg-white/85 p-6 shadow-[0_24px_60px_-34px_rgba(59,130,246,0.25)] backdrop-blur-sm">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <BadgeCheck className="size-4" />
              Trusted healthcare UI principles
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              A calmer interface for higher-stakes health decisions
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Built to feel professional and reassuring, with clear medical blue,
              healing green accents, and focused guidance that supports patient safety.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {["Secure", "Fast", "Reliable"].map((label) => (
                <div
                  key={label}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {items.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                  className="rounded-[1.5rem] border border-slate-100 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(239,248,255,0.75))] p-5 shadow-sm"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 text-white shadow-md shadow-blue-200/70">
                    <Icon className="size-5" />
                  </div>
                  <div className="mt-4 text-base font-semibold text-slate-950">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.copy}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
