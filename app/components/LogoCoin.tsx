"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import EscapeLogo from "@/app/components/EscapeLogo";

// Petit logo fixe en haut à gauche, sur les écrans qui n'ont pas déjà leur
// propre logo (écrans de jeu des équipes, espace admin).
export default function LogoCoin() {
  const pathname = usePathname();
  if (!/^\/admin/.test(pathname) && !/\/jouer/.test(pathname)) return null;
  return (
    <Link href="/" aria-label="ESCAPE GAME CI, accueil" className="fixed left-3 top-3 z-30">
      <EscapeLogo className="w-10 sm:w-12" nom={false} />
    </Link>
  );
}
