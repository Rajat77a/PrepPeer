import { BrainCircuit, DatabaseZap, ShieldCheck } from "lucide-react";
import Link from "next/link";

const items = [
  { icon: BrainCircuit, title: "Questions generated per session", text: "Interview prompts are created for your selected role and released one at a time during the session." },
  { icon: DatabaseZap, title: "Clear data controls", text: "Your profile and saved interview results support your dashboard, progress history and peer ranking." },
  { icon: ShieldCheck, title: "Fair scoring safeguards", text: "Server-side validation, integrity controls and protected evaluation keep rankings more meaningful." },
];

export function TrustCenter() {
  return (
    <section className="section-padding bg-[#f7fbff]" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-6xl">
        <p className="section-label">Trust by design</p>
        <h2 id="trust-heading" className="section-title mt-3 max-w-3xl text-text">Know what happens to your questions, answers and score.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-3xl border border-blue/12 bg-white p-6 shadow-[0_18px_55px_rgba(0,108,255,0.08)]">
              <Icon className="text-blue" size={24} />
              <h3 className="mt-5 font-instrument text-xl font-bold text-text">{title}</h3>
              <p className="mt-3 font-inter text-sm leading-6 text-muted">{text}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 font-inter text-sm text-muted">Read the full <Link className="font-bold text-blue underline-offset-4 hover:underline" href="/privacy">Privacy Policy</Link> and <Link className="font-bold text-blue underline-offset-4 hover:underline" href="/terms">Terms of Service</Link>.</p>
      </div>
    </section>
  );
}
