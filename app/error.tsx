"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7fbff] px-6">
      <section className="max-w-md rounded-2xl border border-[#dbeafe] bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(0,108,255,0.12)] backdrop-blur-xl">
        <p className="font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#006cff]">
          Something went wrong
        </p>
        <h1 className="mt-4 font-inter text-3xl font-black tracking-[-0.04em] text-[#07111f]">
          We could not load this page.
        </h1>
        <p className="mt-3 font-inter text-sm leading-6 text-[#64748b]">
          Please try again. If it keeps happening, contact PrepPeer support.
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
            className="rounded-full border border-[#dbeafe] bg-white px-5 py-3 font-inter text-sm font-bold text-[#07111f] transition hover:border-[#006cff]/40"
          >
            Go home
          </Link>
        </div>
      </section>
    </main>
  );
}
