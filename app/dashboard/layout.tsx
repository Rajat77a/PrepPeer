import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getTrustedProfile } from "@/lib/profile";
import { getCurrentUser } from "@/utils/supabase/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  cookies();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const profile = getTrustedProfile(user);
  const name = profile.fullName || user.email?.split("@")[0] || "PrepPeer user";

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
