"use client";

import { FormEvent, useState } from "react";
import { Navbar } from "@/components/ui/Navbar";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const message = String(form.get("message") ?? "");
    const subject = encodeURIComponent(`PrepPeer enquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    setSubmitted(true);
    window.location.href = `mailto:preppeerenquiries@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white px-6 pb-20 pt-44 text-[#07111f] sm:px-10 sm:pt-40">
        <section className="mx-auto max-w-3xl">
          <h1 className="font-fustat text-4xl font-bold tracking-tight text-black sm:text-6xl">
            Contact Us
          </h1>
          <p className="mt-6 font-fustat text-xl font-semibold leading-8 text-[#07111f] sm:text-2xl">
            We&apos;d love to hear from you.
          </p>
          <p className="mt-6 max-w-2xl font-inter text-base leading-8 text-[#667085] sm:text-lg">
            Have a question, feedback, or just want to say hi? Reach out to us
            and we&apos;ll get back to you within 24 hours.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-12 space-y-6 border-t border-[#07111f]/10 pt-10"
          >
            <label className="block">
              <span className="font-inter text-sm font-semibold text-[#07111f]">
                Name
              </span>
              <input
                required
                type="text"
                name="name"
                autoComplete="name"
                className="mt-2 h-12 w-full border border-[#07111f]/15 bg-white px-4 font-inter text-base text-[#07111f] outline-none transition focus:border-[#006cff] focus:ring-2 focus:ring-[#006cff]/15"
              />
            </label>

            <label className="block">
              <span className="font-inter text-sm font-semibold text-[#07111f]">
                Email
              </span>
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                className="mt-2 h-12 w-full border border-[#07111f]/15 bg-white px-4 font-inter text-base text-[#07111f] outline-none transition focus:border-[#006cff] focus:ring-2 focus:ring-[#006cff]/15"
              />
            </label>

            <label className="block">
              <span className="font-inter text-sm font-semibold text-[#07111f]">
                Message
              </span>
              <textarea
                required
                name="message"
                rows={6}
                className="mt-2 w-full resize-y border border-[#07111f]/15 bg-white px-4 py-3 font-inter text-base leading-7 text-[#07111f] outline-none transition focus:border-[#006cff] focus:ring-2 focus:ring-[#006cff]/15"
              />
            </label>

            <button
              type="submit"
              className="bg-[#006cff] px-7 py-3 font-inter text-sm font-bold text-white transition hover:bg-[#0059d6] focus:outline-none focus:ring-2 focus:ring-[#006cff]/30 focus:ring-offset-2"
            >
              Send Message
            </button>

            {submitted && (
              <p
                role="status"
                className="font-inter text-sm font-semibold text-[#087f5b]"
              >
                Thanks! We&apos;ll get back to you soon.
              </p>
            )}
          </form>
        </section>
      </main>
    </>
  );
}
