import type { User } from "@supabase/supabase-js";

type ProfileMetadata = {
  fullName: string;
  college: string;
  role: string;
  experience: string;
  company: string;
  onboardingComplete: boolean;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const getTrustedProfile = (
  user: Pick<User, "app_metadata" | "user_metadata">
): ProfileMetadata => {
  const trusted = asRecord(user.app_metadata?.preppeer_profile);
  const fallback = asRecord(user.user_metadata);

  return {
    fullName:
      text(trusted.fullName) ||
      text(fallback.full_name) ||
      text(fallback.name),
    college: text(trusted.college) || text(fallback.college),
    role: text(trusted.role) || text(fallback.target_role),
    experience:
      text(trusted.experience) || text(fallback.experience_level),
    company:
      text(trusted.company) || text(fallback.target_company_type),
    onboardingComplete:
      trusted.onboardingComplete === true ||
      fallback.onboarding_complete === true,
  };
};

export const hasCompletedProfile = (
  user: Pick<User, "app_metadata" | "user_metadata">
) => {
  const profile = getTrustedProfile(user);
  return (
    profile.onboardingComplete &&
    Boolean(
      profile.fullName &&
        profile.college &&
        profile.role &&
        profile.experience &&
        profile.company
    )
  );
};

export const getTrustedDisplayMetadata = (
  user: Pick<User, "app_metadata" | "user_metadata">
) => {
  const profile = getTrustedProfile(user);
  return {
    ...user.user_metadata,
    full_name: profile.fullName,
    name: profile.fullName,
    college: profile.college,
    target_role: profile.role,
    experience_level: profile.experience,
    target_company_type: profile.company,
    onboarding_complete: profile.onboardingComplete,
  };
};
