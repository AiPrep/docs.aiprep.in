import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { Providers } from "@/providers";
import { LayoutShell } from "@/components/layout-shell";
import { getApiNavItems } from "@/lib/content";

const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Docstech",
    template: "%s — Docstech",
  },
  description:
    "Documentation site powered by Docstech.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiItems = getApiNavItems();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${notoSans.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="afterInteractive"
          />
        )}
        <Providers>
          <LayoutShell apiItems={apiItems}>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
