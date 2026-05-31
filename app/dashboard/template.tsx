import { DashboardRouteTransition } from "@/components/dashboard/DashboardRouteTransition";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardRouteTransition>{children}</DashboardRouteTransition>;
}
