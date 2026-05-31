import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { getCurrentUser } from "@/utils/supabase/user";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track your interview sessions, scores, and rank improvement over time.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { view?: string };
}) {
  cookies();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "PrepPeer user";
  const firstName = name.split(" ")[0] ?? "there";

  return (
    <DashboardHome
      firstName={firstName}
      hasSessions={searchParams?.view === "returning"}
    />
  );
}
