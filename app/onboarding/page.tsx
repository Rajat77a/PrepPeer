import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
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

const hasCompletedAccountSetup = (
  metadata?: Record<string, unknown> | null
) => {
  const fullName = String(
    metadata?.full_name ?? metadata?.name ?? ""
  ).trim();
  const college = String(metadata?.college ?? "").trim();
  const role = String(metadata?.target_role ?? "").trim();
  const experience = String(metadata?.experience_level ?? "").trim();
  const company = String(metadata?.target_company_type ?? "").trim();

  return (
    metadata?.onboarding_complete === true &&
    Boolean(fullName && college && role && experience && company)
  );
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

  const fullName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
  const college = user.user_metadata?.college ?? "";
  const nextPath = safeNextPath(searchParams?.next);

  if (hasCompletedAccountSetup(user.user_metadata)) {
    redirect(nextPath);
  }

  return (
    <OnboardingForm
      initialName={fullName}
      initialCollege={college}
      postSubmitPath={nextPath}
    />
  );
}
