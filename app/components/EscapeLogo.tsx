import { useId } from "react";

// Logo de la page d'accueil : un œil dans une serrure. Iris bleu glacial,
// pupille rouge sang, nom ESCAPE GAME CI en lettres fines dessous. Il se lit
// petit dans l'en-tête comme grand dans le hero (la taille vient de `className`,
// appliqué à l'icône). Le logo des pages de jeu (GameLogo) reste celui du Gardien.
export default function EscapeLogo({
  className = "w-24",
  nom = true,
  titre = false,
  classeNom = "text-sm",
}: {
  className?: string;
  nom?: boolean;
  titre?: boolean; // true = le nom est le <h1> de la page
  classeNom?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const iris = `iris${uid}`;
  const pupille = `pupille${uid}`;
  const halo = `halo${uid}`;
  const Nom = titre ? "h1" : "span";

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <svg viewBox="0 0 120 150" className={`${className} h-auto`} aria-hidden>
        <defs>
          <radialGradient id={iris} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e6f6ff" />
            <stop offset="55%" stopColor="#8fd3ff" />
            <stop offset="100%" stopColor="#2f78b4" />
          </radialGradient>
          <radialGradient id={pupille} cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#ff5a5f" />
            <stop offset="60%" stopColor="#c4121d" />
            <stop offset="100%" stopColor="#5c050b" />
          </radialGradient>
          <filter id={halo} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Serrure : le pêne (trapèze) puis l'anneau, qui recouvre le haut du pêne */}
        <path
          d="M47 72 L73 72 L88 140 L32 140 Z"
          fill="#070a12"
          stroke="#8fd3ff"
          strokeWidth="1.4"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <circle cx="60" cy="44" r="36" fill="#070a12" stroke="#8fd3ff" strokeWidth="1.4" opacity="0.95" />
        <circle cx="60" cy="44" r="32" fill="none" stroke="#8fd3ff" strokeWidth="0.5" opacity="0.4" />

        {/* Œil */}
        <path
          d="M26 44 Q60 18 94 44 Q60 70 26 44 Z"
          fill="#05070d"
          stroke="#8fd3ff"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <circle cx="60" cy="44" r="13.5" fill={`url(#${iris})`} />
        <circle cx="60" cy="44" r="13.5" fill="none" stroke="#d6efff" strokeWidth="0.5" opacity="0.7" />

        {/* Pupille rouge sang, avec sa lueur qui respire */}
        <circle cx="60" cy="44" r="8" fill="#e0242f" filter={`url(#${halo})`} className="lg-pulse" />
        <circle cx="60" cy="44" r="6" fill={`url(#${pupille})`} />
        <circle cx="57.4" cy="41.4" r="1.6" fill="#ffffff" opacity="0.85" />
      </svg>
      {nom && (
        <Nom className={`font-headline font-semibold uppercase tracking-[0.32em] text-glace-pale ${classeNom}`}>
          Escape Game CI
        </Nom>
      )}
    </div>
  );
}
