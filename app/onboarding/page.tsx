import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { getTrustedProfile, hasCompletedProfile } from "@/lib/profile";
import { safeDashboardPath } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Account Setup",
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
  const nextPath = safeDashboardPath(
    Array.isArray(searchParams?.next) ? searchParams.next[0] : searchParams?.next
  );

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
