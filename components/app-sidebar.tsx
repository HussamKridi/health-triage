"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Ambulance,
  ClipboardPlus,
  FileText,
  HeartPulse,
  History,
  LayoutDashboard,
  ShieldPlus,
  UserRound,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Patient Profile Summary", url: "/dashboard/profile", icon: UserRound },
  { title: "Current Triage Session", url: "/dashboard/session", icon: ClipboardPlus },
  { title: "Follow-up Question Flow", url: "/dashboard/questions", icon: HeartPulse },
  { title: "Triage Result", url: "/dashboard/result", icon: FileText },
  { title: "Emergency Assistance", url: "/dashboard/emergency", icon: Ambulance },
  { title: "Session History", url: "/dashboard/history", icon: History },
  { title: "Quick Check-Up", url: "/dashboard/quick-checkup", icon: ShieldPlus },
];

export function AppSidebar({
  user,
  onDeleteAccount,
  isDeletingAccount,
}: {
  user: {
    name: string;
    email: string;
  };
  onDeleteAccount: () => Promise<void>;
  isDeletingAccount: boolean;
}) {
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
      <SidebarFooter>
        <NavUser
          user={user}
          onDeleteAccount={onDeleteAccount}
          isDeletingAccount={isDeletingAccount}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
