import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track your latest score, rank, and score breakdown.",
};

type Dimension = {
  label: string;
  value: number;
  color?: string;
  reason?: string;
};

type LatestSession = {
  composite_score: number;
  dimensions: Dimension[] | null;
  role: string;
  company_type: string;
  created_at: string;
};

const zeroDimensions: Dimension[] = [
  { label: "Communication", value: 0 },
  { label: "Problem Solving", value: 0 },
  { label: "Specificity", value: 0 },
  { label: "Accuracy", value: 0 },
];

const getDisplayName = (email?: string | null) => {
  if (!email) return "Candidate";

  const emailName = email.split("@")[0] ?? "Candidate";
  const withoutNumbers = emailName.replace(/[0-9]/g, "");
  const withSpaces = withoutNumbers.replace(/[._-]/g, " ").trim();

  return withSpaces
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Candidate";
};

const normalizeDimensions = (
  latestSession: LatestSession | null
): Dimension[] => {
  if (!latestSession) return zeroDimensions;

  if (latestSession.composite_score === 0) {
    return zeroDimensions;
  }

  if (!Array.isArray(latestSession.dimensions)) {
    return zeroDimensions;
  }

  return zeroDimensions.map((fallbackDimension) => {
    const existing = latestSession.dimensions?.find(
      (dimension) =>
        dimension.label.toLowerCase() === fallbackDimension.label.toLowerCase()
    );

    return {
      ...fallbackDimension,
      ...existing,
      value:
        typeof existing?.value === "number" && Number.isFinite(existing.value)
          ? existing.value
          : 0,
    };
  });
};

const getWeakestDimension = (dimensions: Dimension[]) => {
  const weakest = dimensions.reduce((lowest, current) =>
    current.value < lowest.value ? current : lowest
  );

  return weakest.value === 0 ? "Needs valid answers" : weakest.label;
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: latestSession } = await supabase
    .from("interview_sessions")
    .select("composite_score, dimensions, role, company_type, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<LatestSession>();

  const scoreBreakdown = normalizeDimensions(latestSession);
  const recentScore = latestSession?.composite_score ?? 0;
  const role = latestSession?.role ?? "No role yet";
  const companyType = latestSession?.company_type ?? "No company type yet";
  const weakestDimension = getWeakestDimension(scoreBreakdown);
  const name = getDisplayName(user.email);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-14 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-fustat text-[38px] font-extrabold leading-tight tracking-[-0.04em]">
              Welcome back, {name}
            </h1>
            <p className="mt-1 font-inter text-xl font-semibold text-white/35">
              Here is where you stand today.
            </p>
          </div>

          <Link
            href="/interview"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-[#087bff] px-8 py-4 font-inter text-lg font-bold text-white shadow-[0_18px_48px_rgba(0,132,255,0.28)] transition hover:bg-[#006cff]"
          >
            Practice again
            <ArrowRight size={21} />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
          <section className="rounded-[20px] border border-[#073b78] bg-[#07111f] p-10 shadow-[0_24px_80px_rgba(0,132,255,0.08)]">
            <p className="font-inter text-lg font-bold text-white/40">
              Your current rank
            </p>

            <div className="mt-5 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-end gap-4">
                  <p className="font-fustat text-[118px] font-black leading-none tracking-[-0.08em]">
                    --
                  </p>
                  <p className="mb-5 font-inter text-2xl font-black text-white/30">
                    of 254
                  </p>
                </div>

                <p className="mt-5 font-inter text-xl font-bold text-white/45">
                  <span className="text-[#0084ff]">Latest attempt</span>
                  <span className="mx-4 text-white/20">/</span>
                  {role}
                  <span className="mx-4 text-white/20">/</span>
                  {companyType}
                </p>

                <button
                  type="button"
                  className="mt-10 rounded-full border border-white/10 px-6 py-3 font-inter text-sm font-bold text-white/35"
                >
                  Share rank card
                </button>
              </div>

              <div className="flex h-[132px] w-[132px] shrink-0 items-center justify-center rounded-full border-[10px] border-[#0f2238]">
                <div className="text-center">
                  <p className="font-fustat text-3xl font-black">{recentScore}</p>
                  <p className="font-inter text-sm font-black text-white/30">
                    recent score
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[20px] border border-white/10 bg-[#0b0b0b] p-8">
            <p className="font-inter text-sm font-black uppercase tracking-[0.35em] text-white/40">
              Score Breakdown
            </p>

            <div className="mt-8 space-y-6">
              {scoreBreakdown.map((dimension) => (
                <div key={dimension.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-inter text-base font-bold text-white/45">
                      {dimension.label}
                    </p>
                    <p className="font-inter text-base font-black text-white">
                      {dimension.value}
                    </p>
                  </div>

                  <div className="h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#087bff]"
                      style={{
                        width: `${Math.max(0, Math.min(10, dimension.value)) * 10}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-white/5 pt-6">
              <p className="font-inter text-base font-bold text-white/30">
                Weakest:{" "}
                <span className="text-white/45">{weakestDimension}</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
