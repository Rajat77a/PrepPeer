import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { getTrustedProfile, hasCompletedProfile } from "@/lib/profile";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Account Setup",
};

const safeNextPath = (next?: string | string[]) => {
  const value = Array.isArray(next) ? next[0] : next;

  if (!value || !value.startsWith("/dashboard") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: { next?: string | string[] };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = getTrustedProfile(user);
  const nextPath = safeNextPath(searchParams?.next);

  if (hasCompletedProfile(user)) {
    redirect(nextPath);
  }

  return (
    <OnboardingForm
      initialName={profile.fullName}
      initialCollege={profile.college}
      postSubmitPath={nextPath}
    />
  );
}
