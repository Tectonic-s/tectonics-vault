import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * Inter — clean, modern text sans used for the editorial body copy and
 * supporting metadata in the Journey section.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Excon — geometric display sans (Indian Type Foundry).
 * Used for the hero heading, the "Vault." logo, headings and nav items.
 */
const excon = localFont({
  src: [{ path: "../public/fonts/Excon-Variable.woff2", weight: "100 800", style: "normal" }],
  variable: "--font-excon",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

/**
 * Ranade — contemporary text face (Indian Type Foundry).
 * Used for supporting body copy in the About section.
 */
const ranade = localFont({
  src: [{ path: "../public/fonts/Ranade-Variable.woff2", weight: "100 800", style: "normal" }],
  variable: "--font-ranade",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  title: "Vault. — Tharun S",
  description:
    "The Vault. A portfolio where thoughtful design meets reliable engineering.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${excon.variable} ${ranade.variable} ${inter.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
