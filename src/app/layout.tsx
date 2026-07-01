import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/config";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://asasi.pk"),
  title: {
    default: `${BRAND.name} — ${BRAND.shortTagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.tagline,
  keywords: [
    "organic skincare",
    "natural skincare Pakistan",
    "handmade skincare",
    "cruelty-free",
    "chemical-free",
    BRAND.name,
  ],
  openGraph: {
    title: `${BRAND.name} — ${BRAND.shortTagline}`,
    description: BRAND.tagline,
    type: "website",
    siteName: BRAND.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream">{children}</body>
    </html>
  );
}
