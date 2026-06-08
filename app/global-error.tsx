"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-[#07111f] px-6">
          <section className="max-w-md rounded-2xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-[0_24px_80px_rgba(0,108,255,0.18)] backdrop-blur-xl">
            <p className="font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#7cc7ff]">
              PrepPeer
            </p>
            <h1 className="mt-4 font-inter text-3xl font-black tracking-[-0.04em] text-white">
              Something went wrong.
            </h1>
            <p className="mt-3 font-inter text-sm leading-6 text-slate-300">
              Please try again. If this keeps happening, contact PrepPeer
              support.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={reset}
                className="rounded-full bg-[#006cff] px-5 py-3 font-inter text-sm font-bold text-white transition hover:bg-[#0057cc]"
              >
                Try again
              </button>
              <Link
                href="/"
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-inter text-sm font-bold text-white transition hover:border-[#7cc7ff]/60"
              >
                Go home
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
