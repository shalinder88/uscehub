import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your USCEHub account to browse saved observerships, track applications, and connect with the IMG community.",
  alternates: {
    canonical: "https://uscehub.com/auth/signin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
