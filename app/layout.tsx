import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";

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
        <Providers>
          <LayoutShell apiItems={apiItems}>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
