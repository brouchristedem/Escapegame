"use client";

import { useEffect, useMemo, useRef } from "react";
import { DUREE_EFFET_MS, jouerSon, vibrer, type NiveauHorror } from "@/lib/horror";

// Effet de mauvaise réponse : sang qui coule depuis le haut de l'écran, flash
// rouge, et au niveau 3 un jumpscare + texte qui glitche. Purement visuel
// (pointer-events: none) : le joueur peut toujours cliquer, et l'effet
// disparaît tout seul après ~1,5 s. Les animations sont dans globals.css
// (classes .horror-*) et sont réduites si le joueur a demandé moins de mouvement.

type Props = {
  id: number; // change à chaque erreur : relance les animations + varie les gouttes
  niveau: NiveauHorror;
  onFin: () => void;
};

const NOMBRE_GOUTTES: Record<NiveauHorror, number> = { 1: 4, 2: 9, 3: 16 };
// Hauteur max des gouttes (en vh) : petites au niveau 1, quasi plein écran au 3.
const HAUTEUR_GOUTTES: Record<NiveauHorror, [number, number]> = {
  1: [14, 26],
  2: [20, 45],
  3: [38, 85],
};

// Générateur pseudo-aléatoire à graine : le rendu reste pur (même id → mêmes gouttes).
function graine(depart: number): () => number {
  let a = depart | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function EffetHorror({ id, niveau, onFin }: Props) {
  // Ref : le parent se re-rend à chaque seconde (chrono), l'effet ne doit pas
  // se relancer (ni rejouer le son) à cause d'une nouvelle fonction onFin.
  const finRef = useRef(onFin);
  useEffect(() => {
    finRef.current = onFin;
  });

  useEffect(() => {
    jouerSon(niveau);
    vibrer(niveau);
    const minuteur = setTimeout(() => finRef.current(), DUREE_EFFET_MS);
    return () => clearTimeout(minuteur);
  }, [id, niveau]);

  const gouttes = useMemo(() => {
    const hasard = graine(id * 7919 + niveau);
    const [hMin, hMax] = HAUTEUR_GOUTTES[niveau];
    const n = NOMBRE_GOUTTES[niveau];
    return Array.from({ length: n }, (_, i) => ({
      gauche: ((i + hasard() * 0.8) / n) * 100,
      largeur: 6 + hasard() * (niveau === 3 ? 22 : 12),
      hauteur: hMin + hasard() * (hMax - hMin),
      delai: Math.round(hasard() * 260),
      duree: 700 + Math.round(hasard() * 500),
    }));
  }, [id, niveau]);

  return (
    <div className={`horror-voile horror-n${niveau}`} aria-hidden="true">
      {niveau === 1 && <div className="horror-flicker" />}
      {niveau >= 2 && <div className="horror-flash" />}
      {niveau === 3 && <div className="horror-noir" />}
      <div className="horror-bords" />

      {gouttes.map((g, i) => (
        <span
          key={i}
          className="horror-goutte"
          style={
            {
              left: `${g.gauche}%`,
              width: `${g.largeur}px`,
              "--h": `${g.hauteur}vh`,
              "--delai": `${g.delai}ms`,
              "--duree": `${g.duree}ms`,
            } as React.CSSProperties
          }
        />
      ))}

      {niveau === 3 && (
        <div className="horror-jump">
          {/* Visage original : deux yeux rouges fendus et une bouche en dents de scie. */}
          <svg viewBox="0 0 200 200" className="horror-visage" role="presentation">
            <path d="M24 84 Q58 52 92 88 Q58 100 24 84Z" fill="#ff2a2a" />
            <path d="M176 84 Q142 52 108 88 Q142 100 176 84Z" fill="#ff2a2a" />
            <ellipse cx="58" cy="82" rx="4" ry="11" fill="#0a0000" />
            <ellipse cx="142" cy="82" rx="4" ry="11" fill="#0a0000" />
            <path
              d="M26 134 L46 122 L58 150 L74 120 L88 156 L100 118 L112 156 L126 120 L142 150 L154 122 L174 134 Q100 214 26 134Z"
              fill="#ece4d2"
            />
            <path d="M40 140 Q100 196 160 140 Q100 172 40 140Z" fill="#14020a" />
          </svg>
          <p className="horror-texte animate-glitch-shift">IL EST LÀ</p>
        </div>
      )}
    </div>
  );
}
