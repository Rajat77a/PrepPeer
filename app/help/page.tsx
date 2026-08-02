import { ChevronDown } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";

const faqs = [
  {
    question: "Is PrepPeer free?",
    answer:
      "Yes, PrepPeer is free to start. You can take your first interview at no cost.",
  },
  {
    question: "How does the scoring work?",
    answer:
      "Every answer is scored across 4 dimensions — Communication, Problem Solving, Specificity, and Confidence. Your total score is benchmarked against thousands of real candidates to give you a rank.",
  },
  {
    question: "How is PrepPeer different from other prep tools?",
    answer:
      "Most tools give you feedback. PrepPeer gives you a rank. We benchmark your performance against real candidates on a live leaderboard so you know exactly where you stand.",
  },
  {
    question: "What roles does PrepPeer support?",
    answer:
      "SDE Fresher, SDE, Product Manager, MBA, Data Analyst, and Operations roles across company types like Product Startups, SaaS, Fintech, Consulting, and more.",
  },
  {
    question: "How do I improve my rank?",
    answer:
      "Take more sessions. Each session updates your rank in real time. Most users see 2.4x rank improvement after 5 sessions.",
  },
  {
    question: "What happens when I reach the Top 10%?",
    answer:
      "Candidates who reach the Top 10% of their role get featured and gain visibility to recruiters and companies actively looking for talent on PrepPeer.",
  },
  {
    question: "How do I contact support?",
    answer: "Email us at preppeerenquiries@gmail.com",
  },
];

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white px-6 pb-20 pt-44 text-[#07111f] sm:px-10 sm:pt-40">
        <section className="mx-auto max-w-3xl">
          <h1 className="font-fustat text-4xl font-bold tracking-tight text-black sm:text-6xl">
            Help Center
          </h1>
          <p className="mt-5 max-w-2xl font-inter text-base leading-7 text-[#667085] sm:text-lg">
            Straight answers to the questions students ask most.
          </p>

          <div className="mt-12 divide-y divide-[#07111f]/10 border-y border-[#07111f]/10">
            {faqs.map((faq) => (
              <details key={faq.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-fustat text-lg font-semibold text-[#07111f] marker:content-none sm:text-xl">
                  {faq.question}
                  <ChevronDown
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-[#006cff] transition-transform duration-300 group-open:rotate-180"
                  />
                </summary>
                <p className="max-w-2xl pb-7 pr-10 font-inter text-base leading-7 text-[#667085]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
