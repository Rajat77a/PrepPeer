const sections = [
  {
    title: "Information we collect",
    body: "PrepPeer collects the account details you provide, interview setup choices, answers submitted during mock interviews, scoring results, and basic usage data needed to run and secure the service.",
  },
  {
    title: "How we use information",
    body: "We use this information to authenticate users, generate interview questions, evaluate answers, show results, maintain leaderboards, improve reliability, and protect the platform from abuse.",
  },
  {
    title: "AI processing",
    body: "Interview answers and related context may be sent to AI model providers so PrepPeer can generate questions, evaluate responses, detect suspicious answer patterns, and produce feedback.",
  },
  {
    title: "Data sharing",
    body: "We do not sell personal information. We share data only with service providers needed to operate PrepPeer, such as authentication, hosting, email delivery, analytics, and AI infrastructure providers.",
  },
  {
    title: "Security",
    body: "We use access controls, secure cookies, request validation, rate limits, and server-side protections to reduce unauthorized access and misuse.",
  },
  {
    title: "Contact",
    body: "For privacy questions or deletion requests, contact preppeerenquiries@gmail.com.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black sm:px-8 lg:px-12">
      <article className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d46a45]">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-[#111111]">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-[#666666]">Last updated June 09, 2026</p>
        <p className="mt-8 max-w-3xl text-base leading-8 text-[#333333]">
          This Privacy Policy explains how PrepPeer collects, uses, and protects
          information when you use our AI mock interview platform.
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-[#111111]">
                {section.title}
              </h2>
              <p className="mt-3 text-base leading-8 text-[#444444]">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
