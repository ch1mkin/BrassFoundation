import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Inter,
  Noto_Sans_Devanagari,
  Noto_Sans_Gurmukhi,
  Poppins,
} from "next/font/google";
import { cookies } from "next/headers";
import { Providers } from "@/components/providers";
import {
  LOCALE_COOKIE,
  localeHtmlLang,
  parseLocale,
} from "@/lib/i18n/config";
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

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
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
  icons: {
    icon: [{ url: "/brand/logo.png", type: "image/png" }],
    apple: [{ url: "/brand/logo.png", type: "image/png" }],
    shortcut: "/brand/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseOrigin: string | null = null;
  try {
    supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : null;
  } catch {
    supabaseOrigin = null;
  }

  const localeClass =
    locale === "pa"
      ? "locale-pa"
      : locale === "hi"
        ? "locale-hi"
        : "locale-en";

  return (
    <html
      lang={localeHtmlLang(locale)}
      className={localeClass}
      suppressHydrationWarning
    >
      <head>
        {supabaseOrigin ? (
          <>
            <link rel="preconnect" href={supabaseOrigin} />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        ) : null}
      </head>
      <body
        className={`${poppins.variable} ${inter.variable} ${cormorant.variable} ${gurmukhi.variable} ${devanagari.variable} antialiased`}
      >
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
