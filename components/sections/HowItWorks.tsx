import { SectionHeader } from "@/components/ui/SectionHeader";
import ExpandableRow from "@/components/ui/ExpandableRow";
import { HOW_IT_WORKS_STEPS } from "@/lib/mockData";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding bg-off-white w-full">
      <SectionHeader
        chip="How It Works"
        title="Interview. Score. Rank. Repeat."
        subtitle="Four steps from zero to knowing exactly where you stand."
      />

      <div className="mt-16 max-w-4xl mx-auto rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.08)] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
        {HOW_IT_WORKS_STEPS.map((step) => (
          <ExpandableRow
            key={step.number}
            number={String(step.number).padStart(2, "0")}
            title={step.title}
            description={step.description}
            tags={step.tags}
          />
        ))}
      </div>
    </section>
  );
}
