import { FeaturesSection } from "@/components/home/features";
import { FinalCtaSection } from "@/components/home/final-cta";
import { HomeFooter } from "@/components/home/footer";
import { HomeHero } from "@/components/home/hero";
import { HowItWorksSection } from "@/components/home/how-it-works";
import { HomeNavbar } from "@/components/home/navbar";
import { TrustStrip } from "@/components/home/trust-strip";

export function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f8fcff_0%,#ffffff_36%,#f1fbf8_100%)] text-slate-950">
      <HomeNavbar />
      <main>
        <HomeHero />
        <TrustStrip />
        <FeaturesSection />
        <HowItWorksSection />
        <FinalCtaSection />
      </main>
      <HomeFooter />
    </div>
  );
}
