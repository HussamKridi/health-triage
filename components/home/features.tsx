"use client";

import {
  Activity,
  HeartPulse,
  ShieldPlus,
  Siren,
} from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Activity,
    title: "Smart Diagnosis",
    copy: "Transforms symptoms and vitals into guided clinical reasoning with a cleaner decision path.",
    accent: "from-blue-500 to-cyan-400",
  },
  {
    icon: HeartPulse,
    title: "Real-Time Monitoring",
    copy: "Keeps the triage experience responsive to vital changes and follow-up inputs in real time.",
    accent: "from-blue-600 to-teal-400",
  },
  {
    icon: Siren,
    title: "Emergency Assistance",
    copy: "Surfaces urgent escalation guidance quickly when high-risk signals appear.",
    accent: "from-teal-500 to-emerald-400",
  },
  {
    icon: ShieldPlus,
    title: "Personalized Health Insights",
    copy: "Uses persistent patient context to shape more relevant triage and safer next-step recommendations.",
    accent: "from-sky-500 to-green-400",
  },
];

export function FeaturesSection() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <Badge className="rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-blue-700">
            Core capabilities
          </Badge>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Modern health-tech features with a hospital-grade feel
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Built to look alive and reassuring, while staying clinical, credible, and
            easy to understand under pressure.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.56, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, scale: 1.01 }}
              >
                <Card className="h-full rounded-[1.75rem] border border-white/80 bg-white/85 shadow-[0_22px_50px_-34px_rgba(59,130,246,0.3)] backdrop-blur-sm">
                  <CardHeader>
                    <div className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} text-white shadow-lg shadow-blue-200/60`}>
                      <Icon className="size-6" />
                    </div>
                    <CardTitle className="pt-4 text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-7 text-slate-600">
                      {feature.copy}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
