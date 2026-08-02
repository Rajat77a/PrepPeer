import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Features } from "@/components/sections/Features";
import { LeaderboardSection } from "@/components/sections/Leaderboard";
import { SeeItInAction } from "@/components/sections/SeeItInAction";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";
import ComparisonCards from "@/components/sections/ComparisonCards";
import TestimonialCarousel from "@/components/sections/TestimonialCarousel";
import { TrustCenter } from "@/components/sections/TrustCenter";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="overflow-x-hidden min-h-screen relative z-[1]">
        <Hero />
        <HowItWorks />
        <ComparisonCards />
        <Features />
        <LeaderboardSection />
        <TestimonialCarousel />
        <TrustCenter />
        <SeeItInAction />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
