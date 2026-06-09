const cookieTypes = [
  {
    title: "Essential cookies",
    body: "These keep core flows working, including authentication, session security, CSRF protection, and routing after sign in.",
  },
  {
    title: "Preference cookies",
    body: "These may remember interface choices or product settings so the app feels consistent between visits.",
  },
  {
    title: "Analytics and performance",
    body: "If enabled, these help us understand app usage, diagnose reliability issues, and improve PrepPeer. They are not required for core functionality.",
  },
  {
    title: "Managing cookies",
    body: "You can block or delete cookies in your browser settings. Some protected pages and interview flows may stop working if essential cookies are disabled.",
  },
  {
    title: "Contact",
    body: "For cookie questions, contact preppeerenquiries@gmail.com.",
  },
];

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-black sm:px-8 lg:px-12">
      <article className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d46a45]">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-[#111111]">
          Cookie Policy
        </h1>
        <p className="mt-3 text-sm text-[#666666]">Last updated June 09, 2026</p>
        <p className="mt-8 max-w-3xl text-base leading-8 text-[#333333]">
          This Cookie Policy explains how PrepPeer uses cookies and similar
          browser storage to operate and protect the platform.
        </p>

        <div className="mt-10 space-y-8">
          {cookieTypes.map((section) => (
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
