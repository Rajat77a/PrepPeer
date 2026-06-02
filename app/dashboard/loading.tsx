export default function DashboardLoading() {
  return (
    <div className="min-h-screen animate-pulse p-5 sm:p-8">
      <div className="mb-8 h-3 w-32 rounded-full bg-[#006cff]/35" />
      <div className="h-16 w-full max-w-xl rounded-2xl bg-[#dceeff]" />
      <div className="mt-4 h-5 w-full max-w-md rounded-full bg-[#e8f4ff]" />

      <div className="mt-10 grid gap-4 xl:grid-cols-3">
        <div className="h-64 rounded-2xl border border-[#006cff]/10 bg-white/80 shadow-[0_18px_60px_rgba(0,108,255,0.08)] xl:col-span-2" />
        <div className="h-64 rounded-2xl border border-[#006cff]/10 bg-white/80 shadow-[0_18px_60px_rgba(0,108,255,0.08)]" />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="h-56 rounded-2xl border border-[#006cff]/10 bg-white/80 shadow-[0_18px_60px_rgba(0,108,255,0.08)]" />
        <div className="h-56 rounded-2xl border border-[#006cff]/10 bg-white/80 shadow-[0_18px_60px_rgba(0,108,255,0.08)]" />
      </div>
    </div>
  );
}
