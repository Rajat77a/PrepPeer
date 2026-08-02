import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";
import "lenis/dist/lenis.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "PrepPeer — AI Mock Interviews with Real Peer Ranking",
    template: "%s | PrepPeer",
  },
  description:
    "PrepPeer runs AI mock interviews tailored to your role and company type — then ranks you against thousands of real candidates.",
  openGraph: {
    title: "PrepPeer — Know where you stand",
    description:
      "AI mock interviews benchmarked against real peers. Not just feedback. A rank.",
    type: "website",
    siteName: "PrepPeer",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepPeer — Know where you stand",
    description:
      "AI mock interviews benchmarked against real peers. Not just feedback. A rank.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-inter antialiased relative">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
