import Image from "next/image";

// Logo unique de ESCAPE GAME CI : un cadenas rouillé, fissuré, dont l'œil
// regarde, au centre d'un cercle de runes. Il est servi en médaillon rond
// (fond noir d'origine) pour rester lisible sur les pages claires comme sur la
// landing sombre. La taille vient de `className` (ex. "w-24").
// `nom` et `classeNom` sont gardés pour compatibilité : le nom est déjà dans l'image.
export default function EscapeLogo({
  className = "w-24",
  titre = false,
}: {
  className?: string;
  nom?: boolean;
  titre?: boolean; // true = le nom est le <h1> de la page (en texte caché, pour le référencement)
  classeNom?: string;
}) {
  return (
    <div className="inline-flex flex-col items-center">
      <div
        role="img"
        aria-label="ESCAPE GAME CI, le secret est ici"
        className={`relative aspect-square overflow-hidden rounded-full bg-black ring-1 ring-sang/50 shadow-[0_0_24px_-4px_rgba(224,36,47,0.55)] ${className}`}
      >
        <Image
          src="/brand/logo-escape-game-ci.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 160px, 220px"
          className="object-cover"
        />
      </div>
      {titre && <h1 className="sr-only">ESCAPE GAME CI</h1>}
    </div>
  );
}
