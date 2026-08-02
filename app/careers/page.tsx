import { Navbar } from "@/components/ui/Navbar";

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white px-6 pb-20 pt-44 text-[#07111f] sm:px-10 sm:pt-40">
        <article className="mx-auto max-w-3xl">
          <h1 className="font-fustat text-4xl font-bold tracking-tight text-black sm:text-6xl">
            Careers at PrepPeer
          </h1>
          <p className="mt-6 font-fustat text-xl font-semibold leading-8 text-[#07111f] sm:text-2xl">
            We&apos;re not hiring yet — but we&apos;re growing fast.
          </p>

          <div className="mt-10 space-y-7 font-inter text-base leading-8 text-[#667085] sm:text-lg">
            <p>
              PrepPeer is an early-stage AI interview platform built for
              students and job seekers across India. We&apos;re a small team
              moving fast, and we&apos;re not actively hiring right now.
            </p>

            <p>
              But if you&apos;re passionate about AI, education, or helping
              students land their dream jobs — we&apos;d love to hear from you.
            </p>

            <p>
              Send us a note at{" "}
              <a
                href="mailto:preppeerenquiries@gmail.com"
                className="font-semibold text-[#006cff] underline decoration-[#006cff]/30 underline-offset-4 transition-colors hover:text-[#004fbf]"
              >
                preppeerenquiries@gmail.com
              </a>{" "}
              and tell us what you&apos;d bring to PrepPeer.
            </p>
          </div>
        </article>
      </main>
    </>
  );
}
