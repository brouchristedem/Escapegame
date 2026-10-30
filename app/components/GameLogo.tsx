"use client";

import OeilLogo from "@/app/components/OeilLogo";
import { useLogoPersonnalise } from "@/app/components/GameTheme";

// Logo des pages du jeu : l'œil seul. Si l'organisateur a choisi un logo pour
// son jeu (onglet "Apparence"), c'est lui qui s'affiche.
export default function GameLogo({ className = "" }: { className?: string }) {
  // Logo choisi par l'organisateur pour ce jeu (voir onglet "Apparence").
  const logoPersonnalise = useLogoPersonnalise();
  if (logoPersonnalise) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoPersonnalise} alt="Logo du jeu" className={`${className} object-contain`} />;
  }

  return <OeilLogo className={className} />;
}
