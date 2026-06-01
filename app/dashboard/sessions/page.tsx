import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ArrowUpRight } from "lucide-react";
import { RefreshTableButton } from "@/components/dashboard/RefreshTableButton";
import {
  getRankSummary,
  type InterviewSessionRow,
} from "@/lib/ranking";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/supabase/user";

export const metadata: Metadata = {
  title: "Sessions",
};

export default async function DashboardSessionsPage() {
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
  const userSessions = allSessions.filter((session) => session.user_id === user?.id);
  const rankSummary = getRankSummary(allSessions, user?.id);

  return (
    <div className="mx-auto max-w-6xl p-5 sm:p-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#006cff]">
            Session history
          </p>
          <h1 className="mt-3 font-inter text-[clamp(36px,6vw,64px)] font-black leading-none tracking-[-0.05em] text-white">
            Every attempt, in order.
          </h1>
          <p className="mt-4 max-w-2xl font-inter text-base leading-7 text-white/40">
            Review scores, role context, rank movement, and the session that changed
            your standing.
          </p>
        </div>
        <RefreshTableButton />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0d]">
        <div className="hidden grid-cols-[1.05fr_1fr_1fr_1.15fr_0.7fr_0.7fr_0.85fr_48px] gap-4 border-b border-white/[0.08] px-5 py-4 font-inter text-xs font-bold uppercase tracking-[0.16em] text-white/30 lg:grid">
          <span>Date</span>
          <span>Role</span>
          <span>Experience</span>
          <span>Company</span>
          <span>Score</span>
          <span>Rank</span>
          <span>Movement</span>
          <span />
        </div>

        <div className="divide-y divide-white/[0.06]">
          {userSessions.length === 0 && (
            <div className="px-5 py-10 text-center font-inter text-sm font-semibold text-white/35">
              No interview sessions yet. Complete your first interview to enter
              the ranked board.
            </div>
          )}

          {userSessions.map((session, index) => {
            const isLatest = index === 0;

            return (
              <Link
                key={session.id}
                href={`/dashboard/sessions/${session.id}`}
                className="grid gap-3 px-5 py-5 transition hover:bg-white/[0.025] lg:grid-cols-[1.05fr_1fr_1fr_1.15fr_0.7fr_0.7fr_0.85fr_48px] lg:items-center lg:gap-4"
              >
                <div>
                  <p className="font-inter text-sm font-bold text-white">
                    {session.created_at
                      ? new Intl.DateTimeFormat("en", {
                          month: "short",
                          day: "numeric",
                        }).format(new Date(session.created_at))
                      : "Session"}
                  </p>
                  <p className="mt-1 font-inter text-xs text-white/25 lg:hidden">
                    {session.company_type ?? "General"}
                  </p>
                </div>
                <span className="font-inter text-sm font-semibold text-white/55">
                  {session.role ?? "Interview"}
                </span>
                <span className="font-inter text-sm text-white/40">
                  {session.experience ?? "Not set"}
                </span>
                <span className="hidden font-inter text-sm text-white/40 lg:block">
                  {session.company_type ?? "General"}
                </span>
                <span className="font-inter text-sm font-bold text-white">
                  {Number(session.composite_score ?? 0)}
                </span>
                <span className="font-inter text-sm font-bold text-white/60">
                  {isLatest && rankSummary ? `#${rankSummary.rank}` : "-"}
                </span>
                <span className="font-inter text-sm font-bold text-white/45">
                  {isLatest && rankSummary ? rankSummary.rankChange : "-"}
                </span>
                <ArrowUpRight className="hidden h-4 w-4 text-white/20 lg:block" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
