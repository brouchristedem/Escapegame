import type { Metadata, Viewport } from "next";
import { Cinzel, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AdminModeProvider } from "@/lib/adminMode";
import { AuthProvider } from "@/lib/auth";
import Lanterne from "@/app/components/Lanterne";
import OeilRodeur from "@/app/components/OeilRodeur";
import LogoCoin from "@/app/components/LogoCoin";

// Polices de l'identité "Le Gardien" : Cinzel (titres gravés), Alegreya Sans
// (texte courant, auto-hébergé pour garantir les chiffres alignés), IBM Plex Mono (chrono, codes).
const cinzel = Cinzel({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-cinzel", display: "swap" });
const alegreya = localFont({
  src: [
    { path: "./fonts/AlegreyaSans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/AlegreyaSans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/AlegreyaSans-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-alegreya",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-plexmono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://escapegameci.vercel.app"),
  title: "ESCAPE GAME CI",
  description: "Plateforme d'escape game personnalisable",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "ESCAPE GAME CI",
    url: "/",
    title: "ESCAPE GAME CI · Énigmes en équipe",
    description: "Une plateforme d'escape game numérique : chaque équipe suit son parcours d'énigmes.",
    images: [{ url: "/og-image.png?v=3", width: 1200, height: 630, alt: "ESCAPE GAME CI, quelque chose vous attend" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ESCAPE GAME CI · Énigmes en équipe",
    description: "Une plateforme d'escape game numérique : chaque équipe suit son parcours d'énigmes.",
    images: ["/og-image.png?v=3"],
  },
};

export const viewport: Viewport = {
  themeColor: "#cdd5e2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${cinzel.variable} ${alegreya.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Lanterne />
          <OeilRodeur />
          <LogoCoin />
          <AdminModeProvider>
            <div className="flex-1 flex flex-col">{children}</div>
          </AdminModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
