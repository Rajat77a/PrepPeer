import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import {
  getAlphabeticNameFromEmail,
  getTrustedProfile,
  hasCompletedProfile,
} from "@/lib/profile";
import { safeDashboardPath } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Account Setup",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string | string[] }>;
}) {
  const [cookieStore, resolvedSearchParams] = await Promise.all([
    cookies(),
    searchParams,
  ]);
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = getTrustedProfile(user);

  const nextPath = safeDashboardPath(
    Array.isArray(resolvedSearchParams?.next)
      ? resolvedSearchParams.next[0]
      : resolvedSearchParams?.next
  );

  if (hasCompletedProfile(user)) {
    redirect(nextPath);
  }

  return (
    <OnboardingForm
      initialName={profile.fullName || getAlphabeticNameFromEmail(user.email, "")}
      initialCollege={profile.college}
      postSubmitPath={nextPath}
    />
  );
}
