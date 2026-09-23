import type { Metadata } from "next";
import { Archivo, Martian_Mono } from "next/font/google";
import { CredentialsProvider } from "@/components/credentials-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

const martian = Martian_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-martian",
});

export const metadata: Metadata = {
  title: {
    default: "osu! Search",
    template: "%s · osu! Search",
  },
  description: "Advanced osu! beatmap search. Filter by stars, approach rate, mapper, length, and the rest of the official query.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${martian.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a className="skip-link" href="#results">
          Skip to results
        </a>
        <CredentialsProvider>
          <SiteHeader />
          <main className="flex flex-1 flex-col">
            {children}
            <div className="column flex-1" aria-hidden="true" />
          </main>
        </CredentialsProvider>
        <footer className="mt-auto border-t border-line">
          <div className="column flex flex-col gap-2 px-5 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-10">
            <p>Not affiliated with ppy. Beatmap data comes from the osu!api.</p>
            <a className="hover:text-fg" href="https://osu.ppy.sh/docs/">
              osu!api docs
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
