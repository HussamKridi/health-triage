"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { HeaderUser } from "@/components/header-user";
import { useDashboardData } from "@/components/dashboard/dashboard-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/profile": "Patient Profile Summary",
  "/dashboard/session": "Current Triage Session",
  "/dashboard/questions": "Follow-up Question Flow",
  "/dashboard/result": "Triage Result",
  "/dashboard/emergency": "Emergency Assistance",
  "/dashboard/history": "Session History",
  "/dashboard/quick-checkup": "Quick Check-Up",
};

export function DashboardRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isDeletingAccount, deleteAccount } = useDashboardData();

  const title = titles[pathname] ?? "Dashboard";

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: user.displayName ?? user.email?.split("@")[0] ?? "Care User",
          email: user.email ?? "user@example.com",
        }}
        onDeleteAccount={deleteAccount}
        isDeletingAccount={isDeletingAccount}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/">Health Triage</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <HeaderUser
            user={{
              name: user.displayName ?? user.email?.split("@")[0] ?? "Care User",
              email: user.email ?? "user@example.com",
            }}
            onDeleteAccount={deleteAccount}
            isDeletingAccount={isDeletingAccount}
          />
        </header>

        <main className="flex flex-1 flex-col gap-6 bg-[linear-gradient(to_bottom,rgba(248,250,252,1),rgba(255,255,255,1),rgba(240,249,255,0.7))] p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
