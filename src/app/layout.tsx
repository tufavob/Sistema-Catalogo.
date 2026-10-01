import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";
import { Footer } from "@/components/Footer";
import { StoreProvider } from "@/components/store/StoreProvider";
import { HeaderSearch } from "@/components/store/HeaderSearch";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Northumbria · Celulares y Accesorios",
    template: "%s | Northumbria",
  },
  description:
    "Catálogo oficial de celulares y accesorios Northumbria, submarca Buen Muchacho. Equipos nuevos con garantía y pedidos directos por WhatsApp.",
  verification: {
    google: "OUotw3kajTMcC8JO0-UvTnCwzWlr0tRcXN6Z5epKXFk",
  },
};

const headerMessage =
  "Hola, me gustaría pedir información sobre el catálogo de celulares Northumbria.";

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 antialiased">
        <StoreProvider>
          <ScrollProgress />
          <header className="sticky top-0 z-50 border-b border-emerald-900/70 bg-emerald-950">
            <div className="relative mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-xs font-black text-emerald-950">
                  N
                </span>
                <span className="flex min-w-0 flex-col leading-none">
                  <span className="truncate text-[13px] font-black uppercase tracking-[0.2em] text-white">
                    Northumbria
                  </span>
                  <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-400">
                    Buen Muchacho
                  </span>
                </span>
              </Link>

              <HeaderSearch />

              <a
                href={buildWhatsAppLink(headerMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl bg-emerald-500 px-3 text-sm font-bold text-zinc-950 transition-colors hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 sm:px-4"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Pedir</span>
              </a>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
