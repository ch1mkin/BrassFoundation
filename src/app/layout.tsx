import type { Metadata } from "next";
import { Cormorant_Garamond, Fraunces, Source_Sans_3 } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-quote",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Brass Foundation",
    template: "%s · Brass Foundation",
  },
  description:
    "An Ambedkarite organization dedicated to education, empowerment, equality, leadership, and community development.",
  keywords: [
    "Brass Foundation",
    "Ambedkarite",
    "education",
    "empowerment",
    "equality",
    "community",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${sourceSans.variable} ${cormorant.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
