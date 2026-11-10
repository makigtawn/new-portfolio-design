import { getSiteContent } from "@/src/lib/content/load";
import { Hero } from "@/components/home/hero";
import { SelectedWork } from "@/components/home/selected-work";
import { Approach } from "@/components/home/approach";
import { Experience } from "@/components/home/experience";
import { StackMarquee } from "@/components/home/stack-marquee";
import { ServicesContact } from "@/components/home/services-contact";

export default function HomePage() {
  const content = getSiteContent();
  return (
    <main id="main-content">
      <Hero content={content} />
      <SelectedWork content={content} />
      <Approach bio={content.profile.bio} />
      <Experience content={content} />
      <StackMarquee />
      <ServicesContact content={content} />
    </main>
  );
}
