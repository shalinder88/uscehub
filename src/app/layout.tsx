import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ShareWidget } from "@/components/layout/share-widget";
import { TermsGate } from "@/components/legal/terms-gate";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "USCEHub — Verified U.S. Clinical Experience Programs for IMGs",
    template: "%s — USCEHub",
  },
  description:
    "The largest structured database of clinical observership, externship, and research opportunities for International Medical Graduates in the United States.",
  keywords:
    "observership, externship, IMG, international medical graduate, USCE, clinical experience, US hospitals, medical observership, residency preparation",
  authors: [{ name: "USCEHub" }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    siteName: "USCEHub",
    title: "USCEHub — Verified U.S. Clinical Experience Programs for IMGs",
    description:
      "Search observerships, externships, research roles, and postdoc opportunities with direct source links, visa notes, fee ranges, and verification status.",
    url: SITE_URL,
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "USCEHub — IMG Opportunities Database",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "USCEHub — Verified U.S. Clinical Experience Programs for IMGs",
    description:
      "Search observerships, externships, research roles, and postdoc opportunities with direct source links, visa notes, fee ranges, and verification status.",
    images: ["/og-default.png"],
  },
  // Google Search Console verification (audit P1-8):
  //
  // INTENTIONALLY ABSENT. A previous placeholder string
  // "GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE" never resolved to a real
  // token and was removed in cleanup PR1. PR6 explicitly documents:
  // do NOT add a placeholder google-site-verification tag here. Either:
  //   (a) verify the site via DNS TXT record (preferred — no code change),
  //   (b) verify via the HTML-file method (upload to /public/),
  //   (c) only after obtaining a REAL token, re-add
  //       `verification: { google: "<real-token>" }` to this object.
  // Anything fake or templated will fail verification and ship a
  // misleading meta tag to the public.
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
    <html lang="en" className={`${inter.variable} h-full antialiased dark`} suppressHydrationWarning>
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
      <body className="min-h-full flex flex-col font-sans bg-[#faf6e8] dark:bg-[#1d1f26] text-[#0d1418] dark:text-[#f7f5ec]">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "USCEHub",
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/browse?q={search_term_string}`,
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
              url: SITE_URL,
              email: "contact@uscehub.com",
              description:
                "Directory of clinical observership, externship, research, and postdoctoral opportunities for international medical graduates in the United States.",
            }),
          }}
        />
        <Providers>
          {/* Skip link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[9999] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
          >
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
          <Footer />
          <ShareWidget />
          <TermsGate />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
