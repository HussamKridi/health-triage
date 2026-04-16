"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { House, Search, X } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { HeaderUser } from "@/components/header-user";
import { useDashboardData } from "@/components/dashboard/dashboard-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const routeOptions = [
  { url: "/dashboard", title: "Overview" },
  { url: "/dashboard/profile", title: "Profile" },
  { url: "/dashboard/session", title: "Check-Up" },
  { url: "/dashboard/questions", title: "Questions" },
  { url: "/dashboard/result", title: "Results" },
  { url: "/dashboard/emergency", title: "Emergency Help" },
  { url: "/dashboard/history", title: "History" },
  { url: "/dashboard/quick-checkup", title: "Quick Check" },
] as const;

export function DashboardRouteShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useDashboardData();
  const [searchValue, setSearchValue] = useState("");

  const currentRoute = useMemo(
    () => routeOptions.find((option) => option.url === pathname) ?? routeOptions[0],
    [pathname]
  );

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedValue = searchValue.trim().toLowerCase();

    if (!normalizedValue) {
      router.push("/dashboard");
      return;
    }

    const matchedRoute = routeOptions.find((option) =>
      option.title.toLowerCase().includes(normalizedValue)
    );

    router.push(matchedRoute?.url ?? pathname);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-sm">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <form
              onSubmit={handleSearchSubmit}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <div className="relative w-full max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={`Search pages, now on ${currentRoute.title}`}
                  list="dashboard-page-search"
                  className="h-10 rounded-full border-slate-200 bg-white pl-10 pr-10 text-sm"
                  aria-label="Search dashboard pages"
                />
                {searchValue ? (
                  <button
                    type="button"
                    onClick={() => setSearchValue("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
                <datalist id="dashboard-page-search">
                  {routeOptions.map((option) => (
                    <option key={option.url} value={option.title} />
                  ))}
                </datalist>
              </div>
              <Button type="submit" variant="outline" className="hidden rounded-full md:inline-flex">
                Search
              </Button>
            </form>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/">
                <House className="size-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
            </Button>
            <HeaderUser
              user={{
                name: user.displayName ?? user.email?.split("@")[0] ?? "Care User",
                email: user.email ?? "user@example.com",
              }}
            />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 bg-[linear-gradient(to_bottom,rgba(248,250,252,1),rgba(255,255,255,1),rgba(240,249,255,0.7))] p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
