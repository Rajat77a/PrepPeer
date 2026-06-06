import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { getTrustedProfile } from "@/lib/profile";
import { getCurrentUser } from "@/utils/supabase/user";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function DashboardProfilePage() {
  cookies();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const profile = getTrustedProfile(user);
  const name = profile.fullName || user.email?.split("@")[0] || "PrepPeer user";

  return (
    <ProfileForm
      user={{
        name,
        email: user.email ?? "",
        avatarUrl: user.user_metadata?.avatar_url,
        college: profile.college,
        role: profile.role,
        experience: profile.experience,
        company: profile.company,
      }}
    />
  );
}
