import type { Metadata } from "next";
import { Cormorant_Garamond, Libre_Baskerville, Public_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const publicSans = Public_Sans({
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
        className={`${libreBaskerville.variable} ${publicSans.variable} ${cormorant.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
