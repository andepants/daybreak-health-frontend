/**
 * Root Layout Component
 *
 * Configures the application shell with Daybreak brand fonts (Fraunces and Inter),
 * Apollo Client provider, and global styling. All pages inherit this layout.
 */
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ApolloWrapper } from "@/lib/apollo";
import "./globals.css";

/**
 * Fraunces - Daybreak heading font (serif)
 * Used for headings, titles, and display text
 * Weights: 400 (regular), 600 (semibold), 700 (bold)
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

/**
 * Inter - Daybreak body font (sans-serif)
 * Used for body text, UI elements, and general content
 * Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Daybreak Health",
  description: "AI-guided mental health intake for teens and families",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${inter.variable} font-sans antialiased`}
      >
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
