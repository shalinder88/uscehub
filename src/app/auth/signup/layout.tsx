import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a free USCEHub account to save observership listings, track applications, write reviews, and join the IMG community.",
  alternates: {
    canonical: "https://uscehub.com/auth/signup",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
