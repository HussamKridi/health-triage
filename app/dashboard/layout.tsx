import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { DashboardRouteShell } from "@/components/dashboard/dashboard-route-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardRouteShell>{children}</DashboardRouteShell>
    </DashboardProvider>
  );
}
