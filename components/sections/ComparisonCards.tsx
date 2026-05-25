"use client";

const cards = [
  {
    number: "01",
    label: "VS. GENERIC MOCK TESTS",
    title: "Not a question bank. A real interview.",
    description: "Role-specific questions scored the way a real interviewer would.",
    pro: "Real interview flow",
    con: "Generic MCQs, no feedback",
  },
  {
    number: "02",
    label: "VS. HUMAN MOCK INTERVIEWS",
    title: "No scheduling. No waiting. No ₹2000/session.",
    description: "Available 24/7, feedback in seconds, free to start.",
    pro: "Free, instant, 24/7",
    con: "₹2k–15k, schedule needed",
  },
  {
    number: "03",
    label: "VS. CHATGPT PREP",
    title: "ChatGPT coaches you. Only PrepPeer ranks you.",
    description: "Real peer benchmark across thousands of sessions.",
    pro: "Live rank, real benchmark",
    con: "No rank, no peers",
  },
];

export default function ComparisonCards() {
  return (
    <section className="comparison-section">
      <div className="comparison-inner">
        <p className="comparison-label">WHY PrepPeer</p>
        <h2 className="comparison-title">How we&apos;re different.</h2>
        <div className="comparison-grid">
          {cards.map((card) => (
            <article className="comparison-card" key={card.number}>
              <p className="comparison-number">{card.number}</p>
              <p className="comparison-versus">{card.label}</p>
              <h3 className="comparison-card-title">{card.title}</h3>
              <p className="comparison-description">{card.description}</p>
              <div className="comparison-bottom">
                <p className="comparison-bullet comparison-bullet-pro">
                  <span />
                  {card.pro}
                </p>
                <p className="comparison-bullet comparison-bullet-con">
                  <span />
                  {card.con}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <style>{`
        .comparison-section {
          background: #F8F9FC;
          padding: 96px 48px;
        }

        .comparison-inner {
          max-width: 1180px;
          margin: 0 auto;
        }

        .comparison-label {
          margin: 0 0 12px;
          font-size: 12px;
          letter-spacing: 0.08em;
          color: #0084FF;
          font-weight: 700;
          text-align: center;
        }

        .comparison-title {
          margin: 0;
          font-family: var(--font-fustat), sans-serif;
          font-weight: 800;
          font-size: clamp(32px, 4vw, 48px);
          letter-spacing: -1.5px;
          color: #0A0A0F;
          text-align: center;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 48px;
        }

        .comparison-card {
          display: flex;
          min-height: 360px;
          flex-direction: column;
          background: #1B2B5E;
          border: 1px solid rgba(96, 177, 255, 0.18);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 18px 44px rgba(27, 43, 94, 0.14);
          transition: background-color 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease, transform 0.28s ease;
        }

        .comparison-card:hover {
          background: #0084FF;
          border-color: rgba(255, 255, 255, 0.24);
          box-shadow: 0 18px 44px rgba(0, 132, 255, 0.28);
          transform: translateY(-4px);
        }

        .comparison-number {
          margin: 0 0 32px;
          font-family: var(--font-fustat), sans-serif;
          font-size: 54px;
          font-weight: 800;
          line-height: 0.85;
          color: rgba(96, 177, 255, 0.18);
          transition: color 0.28s ease;
        }

        .comparison-versus {
          margin: 0 0 14px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #60B1FF;
          font-weight: 700;
          transition: color 0.28s ease;
        }

        .comparison-card-title {
          margin: 0 0 16px;
          font-family: var(--font-fustat), sans-serif;
          font-weight: 700;
          font-size: 22px;
          line-height: 1.15;
          color: #ffffff;
          transition: color 0.28s ease;
        }

        .comparison-description {
          margin: 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.68);
          line-height: 1.65;
          transition: color 0.28s ease;
        }

        .comparison-bottom {
          margin-top: auto;
          padding-top: 22px;
        }

        .comparison-bullet {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.4;
          transition: color 0.28s ease;
        }

        .comparison-bullet + .comparison-bullet {
          margin-top: 10px;
        }

        .comparison-bullet span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex: 0 0 auto;
          transition: background-color 0.28s ease;
        }

        .comparison-bullet-pro {
          color: #60B1FF;
        }

        .comparison-bullet-pro span {
          background: #60B1FF;
        }

        .comparison-bullet-con {
          color: rgba(255, 255, 255, 0.62);
        }

        .comparison-bullet-con span {
          background: rgba(255, 255, 255, 0.42);
        }

        .comparison-card:hover .comparison-number,
        .comparison-card:hover .comparison-versus,
        .comparison-card:hover .comparison-card-title,
        .comparison-card:hover .comparison-description,
        .comparison-card:hover .comparison-bullet-pro,
        .comparison-card:hover .comparison-bullet-con {
          color: #ffffff;
        }

        .comparison-card:hover .comparison-bullet span {
          background: #ffffff;
        }

        @media (max-width: 767px) {
          .comparison-section {
            padding: 72px 24px;
          }

          .comparison-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
