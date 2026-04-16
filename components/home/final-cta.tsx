"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FinalCtaSection() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <section className="px-6 py-20 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl"
      >
        <Card className="overflow-hidden rounded-[2rem] border-white/80 bg-[linear-gradient(135deg,rgba(37,99,235,0.96),rgba(14,165,233,0.92),rgba(45,212,191,0.88))] p-8 text-white shadow-[0_32px_80px_-30px_rgba(37,99,235,0.45)] sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-white/30 bg-white/12 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                Ready when you are
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Start your health check in seconds
              </h2>
              <p className="mt-4 text-lg leading-8 text-blue-50/90">
                Move into a calm, modern triage flow that guides symptoms, vitals,
                results, and emergency escalation in one connected experience.
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                className="h-12 rounded-full bg-white px-6 text-blue-700 shadow-lg shadow-blue-900/15 hover:bg-blue-50"
              >
                <Link href={!loading && isAuthenticated ? "/dashboard/profile" : "/signup"}>
                  {!loading && isAuthenticated ? "Begin Triage" : "Begin Triage"}
                  {!loading && isAuthenticated ? (
                    <LayoutDashboard className="size-4" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                </Link>
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
