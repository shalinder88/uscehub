import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ShareWidget } from "@/components/layout/share-widget";
import { TermsGate } from "@/components/legal/terms-gate";
import { JourneySelector } from "@/components/journey/journey-selector";
import { PhaseToggle } from "@/components/journey/phase-toggle";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://uscehub.com"),
  title: {
    default: "USCEHub — IMG Career Platform: USCE, Residency, and Career Intelligence",
    template: "%s — USCEHub",
  },
  description:
    "The IMG career operating system — from USCE to residency to attending career. Search verified observerships, fellowship programs, J-1 waiver jobs, salary data, and immigration guidance.",
  keywords:
    "observership, externship, IMG, international medical graduate, USCE, clinical experience, residency, fellowship, J-1 waiver, H-1B, physician jobs, immigration, career",
  authors: [{ name: "USCEHub" }],
  alternates: {
    canonical: "https://uscehub.com",
  },
  openGraph: {
    type: "website",
    siteName: "USCEHub",
    title: "USCEHub — IMG Career Platform",
    description:
      "From USCE to attending career. Search verified clinical opportunities, fellowship programs, waiver jobs, and immigration guidance — one platform for the full IMG journey.",
    url: "https://uscehub.com",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "USCEHub — IMG Career Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "USCEHub — IMG Career Platform",
    description:
      "From USCE to attending career. Search verified clinical opportunities, fellowship programs, waiver jobs, and immigration guidance.",
    images: ["/og-default.png"],
  },
  verification: {
    google: "GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-D8JH9PXCZ3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-D8JH9PXCZ3');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "USCEHub",
              url: "https://www.uscehub.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.uscehub.com/browse?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "USCEHub",
              url: "https://www.uscehub.com",
              email: "contact@uscehub.com",
              description:
                "IMG career operating system — verified clinical opportunities, residency intelligence, fellowship data, J-1 waiver guidance, and career tools for international medical graduates.",
            }),
          }}
        />
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[9999] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
          >
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
          <Footer />
          <ShareWidget />
          <PhaseToggle />
          <JourneySelector />
          <TermsGate />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
