"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Ambulance,
  ClipboardPlus,
  FileText,
  LayoutDashboard,
  HeartPulse,
  History,
  ShieldPlus,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Check-Up", url: "/dashboard/session", icon: ClipboardPlus },
  { title: "Questions", url: "/dashboard/questions", icon: HeartPulse },
  { title: "Results", url: "/dashboard/result", icon: FileText },
  { title: "Emergency Help", url: "/dashboard/emergency", icon: Ambulance },
  { title: "History", url: "/dashboard/history", icon: History },
  { title: "Quick Check", url: "/dashboard/quick-checkup", icon: ShieldPlus },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-teal-500 text-white shadow-lg shadow-sky-200/70">
                <Activity className="size-4" />
              </span>
              <span className="group-data-[collapsible=icon]:hidden">
                <span className="block text-sm font-semibold text-slate-900">
                  Health Triage
                </span>
                <span className="block text-xs text-slate-500">
                  Clinical workspace
                </span>
              </span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                  <Link href={item.url}>
                    <Icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
