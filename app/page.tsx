import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Features } from "@/components/sections/Features";
import { LeaderboardSection } from "@/components/sections/Leaderboard";
import SquishyPricing from "@/components/ui/squishy-pricing";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";
import TypingText from "@/components/sections/TypingText";
import ComparisonCards from "@/components/sections/ComparisonCards";
import TestimonialCarousel from "@/components/sections/TestimonialCarousel";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden min-h-screen relative z-[1]">
        <Hero />
        <HowItWorks />
        <ComparisonCards />
        <Features />
        <LeaderboardSection />
        <TestimonialCarousel />
        <SquishyPricing />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
