import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import Link from "next/link";
import { CheckoutSwitch } from "@/components/checkout-switch";
import { Badge } from "@/components/ui/badge";
import { IS_SANDBOX } from "@/lib/credo";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Common Thread — Everyday Heavyweight Hoodie",
  description: "A demo store taking payments with the Credo inline checkout.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/90 text-foreground backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
              Common Thread
            </Link>
            <div className="flex items-center gap-3">
              <CheckoutSwitch />
              {IS_SANDBOX && <Badge variant="secondary" className="hidden sm:inline-flex">Sandbox</Badge>}
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col">{children}</div>

        <footer className="border-t">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
            <span>Common Thread</span>
            <span>Demo store · Payments by Credo</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
