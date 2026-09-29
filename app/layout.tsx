import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synktastic",
  description: "AI agents went rogue. Trace prompt injections, place a defense, and replay the outcome.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-slate-800">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-mono font-bold tracking-tight text-cyan-300">
              Synktastic
            </Link>
            <div className="flex gap-4 text-sm text-slate-300">
              <Link href="/">Course</Link>
              <Link href="/security">Practice what we teach</Link>
              <Link href="/certificate">Completion</Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
          All tools and data are simulated. Patient IDs are FAKE-*. Built on Guild.ai · Scanned with Snyk.
        </footer>
      </body>
    </html>
  );
}
