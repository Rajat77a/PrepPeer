import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section
      id="cta"
      className="relative section-padding bg-navy overflow-hidden w-full"
    >
      <div
        className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(49,154,255,0.3) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute -bottom-[100px] -left-[100px] w-[400px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,200,150,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <ScrollReveal direction="none" duration={0.8}>
        <div className="relative z-10 max-w-[800px] mx-auto text-center">
          <h2 className="section-title text-white">Your rank is waiting.</h2>
          <p className="font-inter text-base text-white/60 mt-4 mb-10 max-w-lg mx-auto leading-[1.65]">
            Join 12,400+ students who already know where they stand. Start your
            first free interview in 60 seconds.
          </p>
          <div className="flex justify-center">
            <Button href="/login?next=%2Finterview%3Fmode%3Daccount" variant="navy-cta">
              Start Free Interview
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
