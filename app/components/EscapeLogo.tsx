import Image from "next/image";
import TitreMachine from "@/app/components/TitreMachine";

// Logo unique de ESCAPE GAME CI : un cadenas rouillé, fissuré, dont l'œil
// regarde, au centre d'un cercle de runes. Il est servi en médaillon rond
// (fond noir d'origine) pour rester lisible sur les pages claires comme sur la
// landing sombre. La taille vient de `className` (ex. "w-24").
// `nom` et `classeNom` sont gardés pour compatibilité : le nom est déjà dans l'image.
export default function EscapeLogo({
  className = "w-24",
  titre = false,
  nomAnime = false,
  classeNom = "",
}: {
  className?: string;
  nom?: boolean;
  titre?: boolean; // true = le nom est le <h1> de la page (en texte caché, pour le référencement)
  classeNom?: string;
  nomAnime?: boolean; // true = affiche « ESCAPE GAME CI » en dessous, écrit lettre par lettre
}) {
  return (
    <div className="inline-flex flex-col items-center">
      <div
        role="img"
        aria-label="ESCAPE GAME CI, le secret est ici"
        className={`relative aspect-square overflow-hidden rounded-full bg-black ring-1 ring-sang/30 shadow-[0_0_18px_-6px_rgba(224,36,47,0.25)] ${className}`}
      >
        <Image
          src="/brand/logo-escape-game-ci.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 160px, 220px"
          className="object-cover"
        />
        {/* Couches d'ambiance : le centre (l'œil) reste transparent, jamais modifié. */}
        <div aria-hidden="true" className="logo-coeur pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="logo-vacille pointer-events-none absolute inset-0" />
      </div>
      {nomAnime && (
        <TitreMachine
          texte="ESCAPE GAME CI"
          className={`mt-4 titre-gravure font-headline font-semibold uppercase tracking-[0.32em] ${classeNom}`}
        />
      )}
      {titre && <h1 className="sr-only">ESCAPE GAME CI</h1>}
    </div>
  );
}
