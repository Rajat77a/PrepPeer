import ScrollReveal from "@/components/ui/ScrollReveal";
import HoverCard from "@/components/ui/HoverCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TESTIMONIALS } from "@/lib/mockData";

export function Testimonials() {
  return (
    <section id="testimonials" className="section-padding bg-off-white w-full">
      <SectionHeader
        chip="Testimonials"
        title="They practiced. Then they ranked."
        subtitle="Real students. Real rank improvements. Real offers."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
        {TESTIMONIALS.map((t, i) => (
          <ScrollReveal
            key={t.id}
            direction="up"
            delay={i * 0.12}
            duration={0.65}
          >
            <HoverCard className="testi-card bg-white border border-[rgba(0,0,0,0.08)] rounded-[20px] p-7 h-full flex flex-col">
              <p className="text-star text-base mb-4 tracking-wide">★★★★★</p>
              <p className="font-inter text-[15px] text-text leading-[1.7] mb-5 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-fustat font-bold text-[15px] shrink-0"
                  style={{
                    background: t.avatarBg,
                    color: t.avatarColor,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-inter font-semibold text-sm">{t.author}</p>
                  <p className="font-inter text-[13px] text-muted">{t.role}</p>
                </div>
              </div>
            <p className="font-inter text-xs font-semibold text-green mt-1">
              {t.badge}
            </p>
            </HoverCard>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
