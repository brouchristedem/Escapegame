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
        className={`logo-approche relative aspect-square overflow-hidden rounded-full bg-black ring-1 ring-white/10 shadow-[0_0_40px_-10px_rgba(0,0,0,0.95)] ${className}`}
      >
        {/* Le visuel avance lentement vers le spectateur (zoom dans le médaillon). */}
        <div className="logo-avance absolute inset-0">
          <Image
            src="/brand/logo-escape-game-ci.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 240px, 320px"
            className="object-cover"
          />
          {/* Gravures seules : leur rouge pulse comme un cœur. Le reste du logo (dont l'œil) n'est jamais modifié. */}
          <Image
            src="/brand/logo-gravures.webp"
            alt=""
            fill
            sizes="(max-width: 640px) 240px, 320px"
            aria-hidden="true"
            className="logo-gravures-pulse object-cover pointer-events-none"
          />
        </div>
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
