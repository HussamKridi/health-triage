import Link from "next/link";

export function HomeFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/80 px-6 py-8 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-medium text-slate-700">
            Health Triage six © 2026 — Built by Hussam Kridi
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/login" className="transition-colors hover:text-slate-900">
            Login
          </Link>
          <Link href="/signup" className="transition-colors hover:text-slate-900">
            Sign Up
          </Link>
        </div>
      </div>
    </footer>
  );
}
