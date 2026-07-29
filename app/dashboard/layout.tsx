import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getAlphabeticNameFromEmail, getTrustedProfile } from "@/lib/profile";
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
  const name = profile.fullName || getAlphabeticNameFromEmail(user.email);

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
