"use client";

import Link from "next/link";
import { Activity, ChevronRight, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

export function HomeNavbar() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-white/70 bg-white/75 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-slate-900">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-teal-500 text-white shadow-lg shadow-sky-200/70">
            <Activity className="size-5" />
          </span>
          <span className="flex flex-col">
            <span>Health Triage</span>
            <span className="text-xs font-medium text-slate-500">Clinical decision support</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <Button asChild variant="ghost" className="hidden text-slate-600 sm:inline-flex">
            <Link href="#learn-more">Learn More</Link>
          </Button>
          {!loading && isAuthenticated ? (
            <Button asChild className="rounded-full px-5">
              <Link href="/dashboard/profile">
                Dashboard
                <LayoutDashboard className="size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-full px-5">
                <Link href="/signup">
                  Sign Up
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
