"use client";

import { ClipboardPenLine, HeartPulse, ShieldAlert, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";

const steps = [
  {
    icon: ClipboardPenLine,
    title: "Enter your data",
    copy: "Add symptoms, vitals, and core details in a clear intake flow.",
  },
  {
    icon: HeartPulse,
    title: "Answer questions",
    copy: "Respond to guided follow-up prompts tailored to the situation.",
  },
  {
    icon: Stethoscope,
    title: "Get results",
    copy: "Receive a structured triage outcome with reasoning and next steps.",
  },
  {
    icon: ShieldAlert,
    title: "Emergency guidance",
    copy: "High-risk outcomes surface clear escalation pathways immediately.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <Badge className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-emerald-700">
            How it works
          </Badge>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            A guided care flow from first input to safe next action
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            The process is intentionally structured so it feels calm, modern, and
            intuitive while still supporting medical seriousness.
          </p>
        </div>

        <div className="relative mt-12 grid gap-6 lg:grid-cols-4">
          <div className="absolute left-8 right-8 top-10 hidden h-1 rounded-full bg-gradient-to-r from-blue-200 via-sky-200 to-emerald-200 lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-[1.75rem] border border-white/80 bg-white/88 p-6 shadow-[0_18px_42px_-30px_rgba(56,189,248,0.28)] backdrop-blur-sm"
              >
                <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 text-white shadow-lg shadow-blue-200/70">
                  <Icon className="size-6" />
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-sm font-semibold text-blue-700">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950">{step.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{step.copy}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
