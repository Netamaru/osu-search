import type { Metadata } from "next";
import { Archivo, Martian_Mono } from "next/font/google";
import { CredentialsProvider } from "@/components/credentials-provider";
import { GithubIcon } from "@/components/icons";
import { ScrollToTop } from "@/components/scroll-to-top";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://osusearch.netamaru.id",
  ),
  applicationName: "osu! Search",
  title: {
    default: "osu! Search",
    template: "%s · osu! Search",
  },
  description:
    "Advanced osu! beatmap search. Filter by stars, approach rate, mapper, length, and the rest of the official query.",
  openGraph: {
    title: "osu! Search",
    description:
      "Advanced osu! beatmap search. Filter by stars, approach rate, mapper, length, and the rest of the official query.",
    url: "https://osusearch.netamaru.id",
    siteName: "osu! Search",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "osu! Search",
    description:
      "Advanced osu! beatmap search. Filter by stars, approach rate, mapper, length, and the rest of the official query.",
  },
  appleWebApp: {
    title: "osu! Search",
  },
  icons: {
    icon: [
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png", sizes: "96x96" },
    ],
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d){r.classList.add('dark');r.classList.remove('light');}else{r.classList.add('light');r.classList.remove('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${martian.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
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
        <ScrollToTop />
        <footer className="mt-auto border-t border-line text-sm text-muted">
          <div className="column flex flex-col gap-4 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-10">
            <div className="flex flex-col gap-1">
              <p>
                Not affiliated with ppy. Beatmap data comes from the osu!api.
              </p>
              <p className="text-xs text-faint">
                Crafted with care by{" "}
                <a
                  href="https://osu.ppy.sh/users/1830361"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-fg hover:text-accent transition-colors underline decoration-line hover:decoration-accent underline-offset-4"
                >
                  Netamaru
                </a>
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono tracking-wider uppercase">
              <a
                className="flex items-center gap-1.5 hover:text-fg transition-colors"
                href="https://github.com/Netamaru/osu-search"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </a>
              <span className="h-3 w-px bg-line" aria-hidden="true" />
              <a
                className="hover:text-fg transition-colors"
                href="https://osu.ppy.sh/docs/"
                target="_blank"
                rel="noopener noreferrer"
              >
                osu!api docs
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
