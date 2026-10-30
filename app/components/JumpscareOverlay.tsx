"use client";

import { useEffect, useRef, useState } from "react";
import OeilLogo from "@/app/components/OeilLogo";
import VisageHorreur from "@/app/components/VisageHorreur";
import { jouerSonJumpscare, vibrer } from "@/lib/horror";

// Jumpscare piloté par l'organisateur : l'écran se fige une demi-seconde
// (animations en pause, saisie bloquée, aucun son), puis l'œil du logo ou un
// visage surgit en plein écran avec le cri / le métal lacéré. Au total ~2 s,
// puis l'overlay disparaît tout seul. Les animations sont dans globals.css
// (classes .jumpscare-*), sans clignotement si le joueur a demandé moins de
// mouvement, et jamais plus de 3 flashs par seconde sinon.

export const DUREE_FIGE_MS = 500;
export const DUREE_SCARE_MS = 1500;

export default function JumpscareOverlay({ visuel, onFin }: { visuel: "oeil" | "visage"; onFin: () => void }) {
  const [phase, setPhase] = useState<"fige" | "scare">("fige");
  // Ref : le parent se re-rend, la séquence ne doit pas repartir pour autant.
  const finRef = useRef(onFin);
  useEffect(() => {
    finRef.current = onFin;
  });

  useEffect(() => {
    const racine = document.documentElement;
    racine.dataset.jumpscareFige = "1";
    const versScare = setTimeout(() => {
      delete racine.dataset.jumpscareFige;
      setPhase("scare");
      jouerSonJumpscare();
      vibrer(3);
    }, DUREE_FIGE_MS);
    const versFin = setTimeout(() => finRef.current(), DUREE_FIGE_MS + DUREE_SCARE_MS);
    return () => {
      clearTimeout(versScare);
      clearTimeout(versFin);
      delete racine.dataset.jumpscareFige;
    };
  }, []);

  if (phase === "fige") return <div className="jumpscare-fige" aria-hidden="true" />;

  return (
    <div className="jumpscare-scene" aria-hidden="true">
      <div className="jumpscare-sujet">
        {visuel === "oeil" ? <OeilLogo className="jumpscare-oeil" /> : <VisageHorreur className="jumpscare-visage" />}
      </div>
      <p className="jumpscare-texte">{visuel === "oeil" ? "JE TE VOIS" : "IL EST LÀ"}</p>
    </div>
  );
}
