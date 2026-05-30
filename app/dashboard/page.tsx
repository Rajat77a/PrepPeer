import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track your interview sessions, scores, and rank improvement over time.",
};

const metrics = [
  { label: "Session history", value: "12", detail: "mock interviews completed" },
  { label: "Current rank", value: "#41", detail: "among role-matched peers" },
  { label: "Average score", value: "72/100", detail: "across recent attempts" },
];

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "PrepPeer user";
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo variant="light" />
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={name}
                className="h-9 w-9 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 font-inter text-sm font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden text-right sm:block">
              <p className="font-inter text-sm font-bold">{name}</p>
              <p className="font-inter text-xs text-[#9ca3af]">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
          <p className="font-inter text-sm font-bold uppercase tracking-[0.18em] text-[#006cff]">
            PrepPeer Dashboard
          </p>
          <h1 className="mt-4 font-fustat text-[clamp(36px,6vw,68px)] font-extrabold leading-none">
            Welcome back, {name.split(" ")[0]}.
          </h1>
          <p className="mt-4 max-w-2xl font-inter text-lg leading-8 text-[#9ca3af]">
            Track your interview history, rank movement, and score patterns from one place.
          </p>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-white/10 bg-white/[0.05] p-5"
            >
              <p className="font-inter text-sm font-semibold text-[#9ca3af]">{m.label}</p>
              <p className="mt-3 font-fustat text-[36px] font-extrabold">{m.value}</p>
              <p className="mt-1 font-inter text-sm text-[#9ca3af]">{m.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
            <h2 className="font-fustat text-2xl font-extrabold">Session history</h2>
            <div className="mt-5 space-y-3">
              {["Product strategy round", "System design warmup", "Behavioral practice"].map(
                (title, index) => (
                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4"
                  >
                    <div>
                      <p className="font-inter text-sm font-bold">{title}</p>
                      <p className="mt-1 font-inter text-xs text-[#9ca3af]">
                        {index + 1} day{index === 0 ? "" : "s"} ago
                      </p>
                    </div>
                    <span className="font-inter text-sm font-bold text-[#006cff]">
                      {72 - index * 4}/100
                    </span>
                  </div>
                )
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
            <h2 className="font-fustat text-2xl font-extrabold">Rank and score</h2>
            <div className="mt-6 rounded-2xl bg-[#006cff] p-5 shadow-[0_20px_55px_rgba(0,108,255,0.24)]">
              <p className="font-inter text-sm font-bold text-white/70">Current peer rank</p>
              <p className="mt-4 font-fustat text-6xl font-extrabold">#41</p>
              <p className="mt-2 font-inter text-sm text-white/80">Top 23% of candidates</p>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-5">
              <p className="font-inter text-sm font-bold text-[#9ca3af]">Score focus</p>
              <p className="mt-2 font-inter text-base font-semibold">
                Add more specific examples in each answer to lift your rank.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
