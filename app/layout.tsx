import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Noto_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://vault.tectonics.dev"
  ),
  title: "Vault. — Tharun S",
  description:
    "The Vault. A portfolio where thoughtful design meets reliable engineering.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Vault. — Tharun S",
    description:
      "An interactive editorial portfolio engineered through motion, mathematics, and sound.",
    images: [{ url: "/logo.png", width: 1024, height: 1024, alt: "Vault." }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("antialiased", excon.variable, ranade.variable, inter.variable, "font-sans", notoSans.variable, playfairDisplayHeading.variable)}>
      <body>{children}</body>
    </html>
  );
}
