import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AgentDAO — Autonomous AI Governance",
  description:
    "A decentralized autonomous organization where AI agents vote, hire other agents, and manage treasury funds on the Monad blockchain. An AI company running itself.",
  keywords: ["DAO", "AI", "blockchain", "Monad", "autonomous", "governance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} h-full`}>
      <body className={`${inter.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
