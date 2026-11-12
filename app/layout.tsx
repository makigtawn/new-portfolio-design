import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { ReadingProgress } from "@/components/layout/reading-progress";
import { getSiteContent } from "@/src/lib/content/load";
import { getSiteUrl } from "@/src/lib/site-url";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
  weight: "variable",
});

export function generateMetadata(): Metadata {
  const content = getSiteContent();
  return {
    metadataBase: getSiteUrl(),
    title: {
      default: content.seo.siteTitle,
      template: `%s · ${content.profile.name}`,
    },
    description: content.seo.description,
    applicationName: content.profile.name,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: content.seo.siteTitle,
      title: content.seo.siteTitle,
      description: content.seo.description,
      images: [{ url: content.seo.ogImage.src, alt: content.seo.ogImage.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: content.seo.siteTitle,
      description: content.seo.description,
      images: [{ url: content.seo.ogImage.src, alt: content.seo.ogImage.alt }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#F6F3EE",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={lexend.variable}>
      <body>
        <a className="skip-link focus:translate-y-0" href="#main-content">
          Skip to content
        </a>
        <ReadingProgress />
        <SmoothScroll />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
