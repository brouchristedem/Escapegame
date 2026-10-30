"use client";

import { useEffect } from "react";

// Petit panneau affiché quand un joueur touche « Effets effrayants » : il
// explique ce que sont ces effets et laisse choisir de les couper (ou de les
// remettre) sur cet appareil.

type Props = {
  actifs: boolean;
  onChanger: () => void;
  onFermer: () => void;
};

export default function EffetsHorrorInfo({ actifs, onChanger, onFermer }: Props) {
  // Échap ferme le panneau.
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [onFermer]);

  return (
    <div
      className="fixed inset-0 z-[68] flex items-center justify-center bg-black/60 px-5"
      onClick={onFermer}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="effets-horror-titre"
        onClick={(e) => e.stopPropagation()}
        className="animate-pop-in w-full max-w-sm rounded-3xl bg-dalle p-6 text-center text-nuit shadow-2xl ring-1 ring-acier/20"
      >
        <p className="mb-1 text-3xl" aria-hidden="true">
          🩸
        </p>
        <h2 id="effets-horror-titre" className="font-headline text-xl font-bold mb-3">
          Effets effrayants
        </h2>
        <p className="mb-3 text-sm leading-relaxed">
          Quand ton équipe se trompe, l&apos;écran peut te faire peur : du sang qui coule, des cris, des vibrations et un
          écran qui tremble. Plus il y a d&apos;erreurs d&apos;affilée, plus c&apos;est fort.
        </p>
        <p className="mb-4 text-sm leading-relaxed">
          Si tu es sensible, si tu as peur ou si tu es dans un endroit calme, tu peux les couper sur ton téléphone. Ça ne
          change rien au jeu : le court temps d&apos;attente avant de réessayer reste le même pour tout le monde.
        </p>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-acier">
          Actuellement : {actifs ? "activés" : "désactivés"} sur cet appareil
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onChanger}
            className="rounded-full bg-gradient-to-r from-lueur to-lueur-fonce px-6 py-3 font-semibold text-nuit shadow-md transition-all duration-200 active:scale-[0.98]"
          >
            {actifs ? "Désactiver les effets" : "Réactiver les effets"}
          </button>
          <button type="button" onClick={onFermer} className="px-6 py-2 text-sm text-nuit/70 underline underline-offset-2">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
