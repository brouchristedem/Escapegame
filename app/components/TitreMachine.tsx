"use client";

import { useEffect, useState } from "react";

// Titre qui s'écrit « tout seul », lettre par lettre, au rythme irrégulier,
// avec de petites hésitations. Rien devant, rien derrière : ni curseur, ni
// fausse lettre, seulement le texte.
// Purement décoratif (aria-hidden) : le vrai titre accessible est le <h1>
// masqué d'EscapeLogo. En mouvement réduit, le texte s'affiche d'un coup.
export default function TitreMachine({ texte, className = "" }: { texte: string; className?: string }) {
  const [affiche, setAffiche] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setAffiche(texte), 0);
      return () => clearTimeout(t);
    }
    let annule = false;
    const attendre = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    (async () => {
      await attendre(700);
      let courant = "";
      for (let i = 0; i < texte.length && !annule; i++) {
        if (i > 2 && Math.random() < 0.14) await attendre(450); // hésitation
        courant += texte[i];
        setAffiche(courant);
        await attendre(100 + Math.random() * 170);
      }
    })();
    return () => {
      annule = true;
    };
  }, [texte]);

  return (
    <p aria-hidden="true" className={`min-h-[1.5em] ${className}`}>
      {affiche}
    </p>
  );
}
