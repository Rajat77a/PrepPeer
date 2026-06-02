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
    return "/dashboard/profile";
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

  const fullName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
  const college = user.user_metadata?.college ?? "";
  const nextPath = safeNextPath(searchParams?.next);

  if (fullName && college) {
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
