import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { getSiteContent } from "@/src/lib/content/load";

export function SiteHeader() {
  const content = getSiteContent();
  return (
    <header
      id="top"
      className="border-line relative mx-auto flex w-[min(calc(100%-2.5rem),75rem)] items-center justify-between border-b py-4 md:w-[min(calc(100%-5rem),75rem)] md:py-5"
    >
      <MobileNavigation brandName={content.profile.name} />
    </header>
  );
}
