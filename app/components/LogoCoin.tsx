"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import OeilLogo from "@/app/components/OeilLogo";

// Petit logo fixe en haut à gauche : le logo du jeu (le Gardien) sur les écrans
// de jeu des équipes, le logo ESCAPE GAME CI sur l'admin.
export default function LogoCoin() {
  const pathname = usePathname();
  if (!/^\/admin/.test(pathname) && !/\/jouer/.test(pathname)) return null;
  return (
    <Link href="/" aria-label="ESCAPE GAME CI, accueil" className="fixed left-3 top-3 z-30">
      <OeilLogo className="w-10 sm:w-12" />
    </Link>
  );
}
