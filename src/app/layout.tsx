import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Inter,
  Noto_Sans_Gurmukhi,
  Poppins,
} from "next/font/google";
import { cookies } from "next/headers";
import { Providers } from "@/components/providers";
import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n/config";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-quote",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const gurmukhi = Noto_Sans_Gurmukhi({
  variable: "--font-gurmukhi",
  subsets: ["gurmukhi"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Brass Foundation",
    template: "%s · Brass Foundation",
  },
  description:
    "Empowering communities through education, equality, leadership and community development inspired by Dr. B. R. Ambedkar.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return (
    <html
      lang={locale === "pa" ? "pa" : "en"}
      className={locale === "pa" ? "locale-pa" : "locale-en"}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${poppins.variable} ${inter.variable} ${cormorant.variable} ${gurmukhi.variable} antialiased`}
      >
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
