"use client";

import Image from "next/image";
import { useLogoPersonnalise } from "@/app/components/GameTheme";

// Logo unique de ESCAPE GAME CI (le même que sur tout le site). Si l'organisateur
// a choisi un logo pour son jeu (onglet "Apparence"), c'est lui qui s'affiche.
export default function GameLogo({ className = "" }: { className?: string }) {
  // Logo choisi par l'organisateur pour ce jeu (voir onglet "Apparence").
  const logoPersonnalise = useLogoPersonnalise();
  if (logoPersonnalise) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoPersonnalise} alt="Logo du jeu" className={`${className} object-contain`} />;
  }

  return (
    <div
      role="img"
      aria-label="ESCAPE GAME CI"
      className={`relative aspect-square overflow-hidden rounded-full bg-black ring-1 ring-sang/50 shadow-[0_0_24px_-4px_rgba(224,36,47,0.55)] ${className}`}
    >
      <Image
        src="/brand/logo-escape-game-ci.webp"
        alt=""
        fill
        priority
        sizes="(max-width: 640px) 120px, 160px"
        className="object-cover"
      />
    </div>
  );
}
