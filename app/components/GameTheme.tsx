"use client";

// Applique la personnalisation d'un jeu à toutes ses pages (/g/[gameId]/...).
// Seul le logo est personnalisable : les couleurs sont celles de la palette
// ESCAPE GAME CI, identiques sur tout le site (voir .theme-abime dans globals.css).

import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getQuizConfig } from "@/lib/data";
import { Personnalisation } from "@/lib/types";

const LogoContext = createContext<string | null>(null);

// Logo personnalisé du jeu en cours, ou null pour utiliser le logo par défaut.
export function useLogoPersonnalise(): string | null {
  return useContext(LogoContext);
}

export default function GameTheme({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const gameId = Array.isArray(params.gameId) ? params.gameId[0] : params.gameId;
  const [perso, setPerso] = useState<Personnalisation | null>(null);

  useEffect(() => {
    if (!gameId) return;
    getQuizConfig(gameId)
      .then((c) => setPerso(c.personnalisation ?? null))
      .catch(() => {});
  }, [gameId]);

  return (
    <LogoContext.Provider value={perso?.logo || null}>
      {children}
    </LogoContext.Provider>
  );
}
