import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/utils/supabase/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  cookies();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const hasRequiredProfile =
    Boolean(user.user_metadata?.full_name ?? user.user_metadata?.name) &&
    Boolean(user.user_metadata?.college);

  if (!hasRequiredProfile) redirect("/onboarding");

  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "PrepPeer user";

  return (
    <DashboardShell
      user={{
        name,
        email: user.email ?? "",
        avatarUrl: user.user_metadata?.avatar_url,
      }}
    >
      {children}
    </DashboardShell>
  );
}
