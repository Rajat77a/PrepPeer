import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function DashboardProfilePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      }}
    />
  );
}
