import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getRankSummary,
  type InterviewSessionRow,
} from "@/lib/ranking";
import { scoreDimensions } from "@/components/dashboard/DashboardData";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/supabase/user";

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const user = await getCurrentUser();

  const { data: rows } = await supabase
    .from("interview_sessions")
    .select(
      "id,user_id,role,experience,company_type,composite_score,dimensions,question_scores,summary,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(1000);

  const allSessions = (rows ?? []) as InterviewSessionRow[];
  const session = allSessions.find(
    (item) => item.id === params.id && item.user_id === user?.id
  );

  if (!session) notFound();

  const rankSummary = getRankSummary(allSessions, user?.id);
  const dimensions = session.dimensions?.length
    ? session.dimensions
    : scoreDimensions.map((dimension) => ({
        label: dimension.label,
        value: dimension.score,
      }));

  return (
    <div className="mx-auto max-w-5xl p-5 sm:p-8">
      <Link
        href="/dashboard/sessions"
        className="mb-8 inline-flex items-center gap-2 font-inter text-sm font-bold text-white/40 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Sessions
      </Link>

      <section className="relative overflow-hidden rounded-2xl border border-[#006cff]/20 bg-gradient-to-br from-[#0d1929] to-[#080808] p-7 sm:p-10">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-[#006cff]/10 blur-[90px]" />
        <div className="relative z-10">
          <p className="font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#006cff]">
            {session.created_at
              ? new Intl.DateTimeFormat("en", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(session.created_at))
              : "Session"}
          </p>
          <h1 className="mt-4 font-inter text-[clamp(36px,6vw,68px)] font-black leading-none tracking-[-0.05em] text-white">
            {session.role ?? "Interview"}
          </h1>
          <p className="mt-4 font-inter text-white/40">
            {session.company_type ?? "General"} / {session.experience ?? "Not set"}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Stat label="Score" value={`${Number(session.composite_score ?? 0)}/100`} />
            <Stat label="Current rank" value={rankSummary ? `#${rankSummary.rank}` : "-"} />
            <Stat label="Rank change" value={rankSummary?.rankChange ?? "-"} />
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-6">
        <p className="mb-5 font-inter text-xs font-bold uppercase tracking-[0.22em] text-white/40">
          Score dimensions
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {dimensions.map((dimension) => (
            <div key={dimension.label}>
              <div className="mb-2 flex justify-between font-inter text-sm">
                <span className="font-semibold text-white/55">{dimension.label}</span>
                <span className="font-bold text-white">{dimension.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-[#006cff]"
                  style={{ width: `${dimension.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="font-inter text-xs font-bold uppercase tracking-[0.18em] text-white/30">
        {label}
      </p>
      <p className="mt-3 font-inter text-3xl font-black text-white">{value}</p>
    </div>
  );
}
