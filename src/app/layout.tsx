import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ShareWidget } from "@/components/layout/share-widget";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://uscehub.com"),
  title: {
    default: "USCEHub — The Largest IMG Opportunities Database",
    template: "%s — USCEHub",
  },
  description:
    "The largest structured database of clinical observership, externship, and research opportunities for International Medical Graduates in the United States.",
  keywords:
    "observership, externship, IMG, international medical graduate, USCE, clinical experience, US hospitals, medical observership, residency preparation",
  authors: [{ name: "USCEHub" }],
  alternates: {
    canonical: "https://uscehub.com",
  },
  openGraph: {
    type: "website",
    siteName: "USCEHub",
    title: "USCEHub — The Largest IMG Opportunities Database",
    description:
      "The largest structured database of clinical observership, externship, and research opportunities for International Medical Graduates in the United States.",
    url: "https://uscehub.com",
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
    title: "USCEHub — The Largest IMG Opportunities Database",
    description:
      "The largest structured database of clinical observership, externship, and research opportunities for International Medical Graduates in the United States.",
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
      <body className="min-h-full flex flex-col font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ShareWidget />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
