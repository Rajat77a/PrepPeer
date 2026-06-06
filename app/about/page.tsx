import { Navbar } from "@/components/ui/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white px-6 pb-20 pt-44 text-[#07111f] sm:px-10 sm:pt-40">
        <article className="mx-auto max-w-3xl">
          <h1 className="font-fustat text-4xl font-bold tracking-tight text-black sm:text-6xl">
            About PrepPeer
          </h1>

          <div className="mt-10 space-y-7 font-inter text-base leading-8 text-[#667085] sm:text-lg">
            <p>
              We built PrepPeer because mock interviews shouldn&apos;t cost
              ₹2000 a session or require scheduling a week in advance.
            </p>

            <p>
              PrepPeer is an AI-powered mock interview platform built for
              Indian students and job seekers. It runs real interview
              simulations tailored to your role, experience level, and company
              type — then ranks your performance against thousands of real
              candidates on a live leaderboard.
            </p>

            <p>
              Most interview prep tools give you feedback. PrepPeer gives you a
              rank. Because knowing you&apos;re in the top 23% of SDE Freshers
              tells you something a score out of 10 never can.
            </p>

            <p>
              Built by a student, for students. Free to start. No scheduling.
              No waiting.
            </p>

            <p className="border-l-2 border-[#006cff] pl-6 font-semibold text-[#07111f]">
              Our mission: help every student walk into their interview knowing
              exactly where they stand.
            </p>
          </div>
        </article>
      </main>
    </>
  );
}
