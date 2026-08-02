import { Navbar } from "@/components/ui/Navbar";

const quickFacts = [
  ["Founded", "2026"],
  ["Based in", "India"],
  ["Users", "12,400+ mock interviews benchmarked"],
  [
    "Mission",
    "Help every student know where they stand before the real interview",
  ],
];

export default function PressPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white px-6 pb-20 pt-44 text-[#07111f] sm:px-10 sm:pt-40">
        <article className="mx-auto max-w-3xl">
          <h1 className="font-fustat text-4xl font-bold tracking-tight text-black sm:text-6xl">
            Press
          </h1>
          <p className="mt-6 font-fustat text-xl font-semibold leading-8 text-[#07111f] sm:text-2xl">
            Writing about PrepPeer?
          </p>

          <div className="mt-10 space-y-7 font-inter text-base leading-8 text-[#667085] sm:text-lg">
            <p>
              PrepPeer is an AI-powered mock interview platform that helps
              students and job seekers across India practice interviews and
              benchmark their performance against real peers on a live
              leaderboard.
            </p>

            <p>
              For press inquiries, interviews, or media assets, reach out to us
              at:
              <br />
              <a
                href="mailto:preppeerenquiries@gmail.com"
                className="font-semibold text-[#006cff] underline decoration-[#006cff]/30 underline-offset-4 transition-colors hover:text-[#004fbf]"
              >
                preppeerenquiries@gmail.com
              </a>
            </p>

            <p>We&apos;ll get back to you within 48 hours.</p>
          </div>

          <section className="mt-14 border-t border-[#07111f]/10 pt-9">
            <h2 className="font-fustat text-2xl font-bold text-black">
              Quick facts
            </h2>
            <dl className="mt-6 divide-y divide-[#07111f]/10 border-y border-[#07111f]/10">
              {quickFacts.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-2 py-5 font-inter sm:grid-cols-[140px_1fr]"
                >
                  <dt className="font-semibold text-[#07111f]">{label}</dt>
                  <dd className="leading-7 text-[#667085]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </article>
      </main>
    </>
  );
}
