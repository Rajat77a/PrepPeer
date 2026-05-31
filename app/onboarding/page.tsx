import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Account Setup",
};

export default async function OnboardingPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const fullName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
  const college = user.user_metadata?.college ?? "";

  if (fullName && college) {
    redirect("/dashboard/profile");
  }

  return (
    <OnboardingForm
      initialName={fullName}
      initialCollege={college}
    />
  );
}
