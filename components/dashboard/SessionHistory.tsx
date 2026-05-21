import Link from "next/link";
import { SESSION_HISTORY } from "@/lib/mockData";

export function SessionHistory() {
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
        <h3 className="font-fustat font-bold text-lg text-text">
          Session history
        </h3>
      </div>
      {SESSION_HISTORY.map((session, i) => (
        <div
          key={session.id}
          className={`flex flex-wrap items-center gap-4 px-6 py-4 border-b border-[rgba(0,0,0,0.05)] ${
            i % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
          }`}
        >
          <span className="font-inter text-sm text-muted w-28">{session.date}</span>
          <span className="font-inter text-sm text-text flex-1 min-w-[120px]">
            {session.role}
          </span>
          <span className="font-inter text-sm text-muted">{session.companyType}</span>
          <span className="font-inter font-semibold text-sm text-blue w-10">
            {session.score}
          </span>
          <Link
            href="/results"
            className="font-inter text-sm text-blue hover:underline cursor-pointer"
          >
            View report
          </Link>
        </div>
      ))}
    </div>
  );
}
