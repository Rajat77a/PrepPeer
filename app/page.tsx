import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/sections/Hero";
import { TrustedBar } from "@/components/sections/TrustedBar";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Features } from "@/components/sections/Features";
import { LeaderboardSection } from "@/components/sections/Leaderboard";
import { ScoreCardSection } from "@/components/sections/ScoreCard";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden min-h-screen relative z-[1]">
        <Hero />
        <TrustedBar />
        <HowItWorks />
        <Features />
        <LeaderboardSection />
        <ScoreCardSection />
        <Testimonials />
        <Pricing />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
