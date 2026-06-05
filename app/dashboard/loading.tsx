export default function DashboardLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(0,108,255,0.14),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(125,255,217,0.12),transparent_28%),linear-gradient(180deg,#f8fcff_0%,#edf7ff_48%,#ffffff_100%)] p-5 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,108,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,108,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-28 left-[-24%] h-48 w-[50%] animate-[dashboardSweep_1.15s_ease-in-out_infinite] rotate-12 bg-[linear-gradient(90deg,transparent,rgba(0,108,255,0.14),rgba(155,212,255,0.28),transparent)] blur-2xl"
        aria-hidden="true"
      />
      <div className="relative z-10 animate-pulse">
        <div className="mb-8 h-3 w-32 rounded-full bg-[#006cff]/35" />
        <div className="h-16 w-full max-w-xl rounded-2xl bg-white/68 shadow-[0_18px_60px_rgba(0,108,255,0.08)]" />
        <div className="mt-4 h-5 w-full max-w-md rounded-full bg-white/58 shadow-[0_10px_30px_rgba(0,108,255,0.06)]" />

        <div className="mt-10 grid gap-4 xl:grid-cols-3">
          <div className="h-64 rounded-[28px] border border-[#006cff]/12 bg-white/72 shadow-[0_22px_70px_rgba(0,108,255,0.10)] backdrop-blur-xl xl:col-span-2" />
          <div className="h-64 rounded-[28px] border border-[#006cff]/12 bg-white/72 shadow-[0_22px_70px_rgba(0,108,255,0.10)] backdrop-blur-xl" />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <div className="h-56 rounded-[28px] border border-[#006cff]/12 bg-white/72 shadow-[0_22px_70px_rgba(0,108,255,0.10)] backdrop-blur-xl" />
          <div className="h-56 rounded-[28px] border border-[#006cff]/12 bg-white/72 shadow-[0_22px_70px_rgba(0,108,255,0.10)] backdrop-blur-xl" />
        </div>
      </div>
    </div>
  );
}
