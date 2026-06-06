import { Navbar } from "@/components/ui/Navbar";

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white px-6 pb-20 pt-44 text-[#07111f] sm:px-10 sm:pt-40">
        <article className="mx-auto max-w-3xl">
          <h1 className="font-fustat text-4xl font-bold tracking-tight text-black sm:text-6xl">
            Blog
          </h1>
          <p className="mt-6 font-fustat text-xl font-semibold leading-8 text-[#07111f] sm:text-2xl">
            Coming soon.
          </p>

          <div className="mt-10 space-y-7 font-inter text-base leading-8 text-[#667085] sm:text-lg">
            <p>
              We&apos;ll be sharing interview tips, rank improvement
              strategies, and PrepPeer updates here soon. Stay tuned.
            </p>

            <p>
              In the meantime, reach us at{" "}
              <a
                href="mailto:preppeerenquiries@gmail.com"
                className="font-semibold text-[#006cff] underline decoration-[#006cff]/30 underline-offset-4 transition-colors hover:text-[#004fbf]"
              >
                preppeerenquiries@gmail.com
              </a>
            </p>
          </div>
        </article>
      </main>
    </>
  );
}
