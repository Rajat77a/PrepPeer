"use client";

const cards = [
  {
    number: "01",
    versus: "vs. Generic Mock Tests",
    subtitle: "Testbook, IndiaBIX",
    title: "Not a question bank.\nA real interview.",
    description:
      "Mock test sites give you MCQs. PrepPeer asks open-ended interview questions tailored to your exact role, experience level, and company type — then scores your written answer the way a real interviewer would.",
    pro: "Role-specific, typed answers, AI scored",
    con: "Generic MCQs, no real feedback",
  },
  {
    number: "02",
    versus: "vs. Human Mock Interviews",
    subtitle: "Coaching, career counselors",
    title: "No scheduling.\nNo waiting.\nNo Rs.2000/session.",
    description:
      "Human mock interviews cost Rs.2,000–15,000 and need to be booked days in advance. PrepPeer is available 24/7, gives feedback in seconds.",
    pro: "Free to start, instant, available 24/7",
    con: "Rs.2k–15k/session, schedule-dependent",
  },
  {
    number: "03",
    versus: "vs. ChatGPT Prep",
    subtitle: "Claude, Gemini",
    title: "ChatGPT coaches you.\nOnly PrepPeer ranks you.",
    description:
      "AI chatbots give you feedback in isolation. PrepPeer aggregates scores across thousands of real sessions — so you know where you stand among everyone applying for the same role.",
    pro: "Real peer benchmark, live leaderboard",
    con: "No rank, no benchmark, no peers",
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
              <span className="comparison-number">{card.number}</span>
              <p className="comparison-versus">{card.versus}</p>
              <p className="comparison-subtitle">{card.subtitle}</p>
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
          text-transform: none;
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
          position: relative;
          display: flex;
          min-height: 430px;
          flex-direction: column;
          background: #ffffff;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
        }

        .comparison-number {
          position: absolute;
          top: 20px;
          right: 24px;
          font-family: var(--font-fustat), sans-serif;
          font-size: 36px;
          font-weight: 800;
          line-height: 1;
          color: rgba(0,132,255,0.12);
        }

        .comparison-versus {
          margin: 0 0 6px;
          max-width: 220px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #A8A49E;
          font-weight: 700;
        }

        .comparison-subtitle {
          margin: 0 0 28px;
          font-size: 10px;
          color: #C4C0BA;
          font-weight: 600;
        }

        .comparison-card-title {
          margin: 0 0 18px;
          font-family: var(--font-fustat), sans-serif;
          font-weight: 700;
          font-size: 20px;
          line-height: 1.18;
          color: #0A0A0F;
          white-space: pre-line;
        }

        .comparison-description {
          margin: 0;
          font-size: 13px;
          color: #6B6863;
          line-height: 1.65;
        }

        .comparison-bottom {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #E5E2DC;
        }

        .comparison-bullet {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 0;
          font-size: 11px;
          font-weight: 600;
          line-height: 1.4;
        }

        .comparison-bullet + .comparison-bullet {
          margin-top: 10px;
        }

        .comparison-bullet span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex: 0 0 auto;
        }

        .comparison-bullet-pro {
          color: #0084FF;
        }

        .comparison-bullet-pro span {
          background: #0084FF;
        }

        .comparison-bullet-con {
          color: #A8A49E;
        }

        .comparison-bullet-con span {
          background: #C4C0BA;
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
