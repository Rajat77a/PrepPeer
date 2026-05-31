import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { getCurrentUser } from "@/utils/supabase/user";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function DashboardProfilePage() {
  cookies();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "PrepPeer user";

  return (
    <ProfileForm
      user={{
        name,
        email: user.email ?? "",
        avatarUrl: user.user_metadata?.avatar_url,
        college: user.user_metadata?.college,
        role: user.user_metadata?.target_role,
        experience: user.user_metadata?.experience_level,
        company: user.user_metadata?.target_company_type,
      }}
    />
  );
}
