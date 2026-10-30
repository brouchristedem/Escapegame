"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ecouterEffetsHorreur } from "@/lib/data";
import { debloquerSon, lireEffetsActifs } from "@/lib/horror";
import { demarrerPossede } from "@/lib/possede";
import { EFFETS_HORREUR_PAR_DEFAUT, EffetsHorreur, FrequenceJumpscare } from "@/lib/types";
import JumpscareOverlay from "@/app/components/JumpscareOverlay";

// Branche les pages joueur (/g/{gameId}/jouer/...) sur l'interrupteur de
// l'organisateur (onglet « Événements » de l'admin, et télécommande) : tout
// s'active et s'éteint en direct, sans recharger la page. Ne rend rien tant
// qu'aucun effet n'est en cours.
//
// Le réglage « effets effrayants » de l'appareil (voir lib/horror.ts) reste
// prioritaire : un joueur qui l'a coupé ne voit ni jumpscare ni retournement.

// Délai entre deux apparitions aléatoires, par joueur (chacun le sien : ça
// n'arrive pas à tout le monde en même temps).
const PLAGES_MS: Record<FrequenceJumpscare, [number, number]> = {
  rare: [4 * 60000, 8 * 60000],
  normale: [2 * 60000, 4 * 60000],
  frequente: [60000, 120000],
};
// Première apparition après l'armement : assez vite pour que l'organisateur
// voie que ça marche, assez tard pour surprendre.
const PREMIERE_PLAGE_MS: [number, number] = [30000, 90000];

export default function EffetsHorreurJeu() {
  const params = useParams();
  const gameId = Array.isArray(params.gameId) ? params.gameId[0] : params.gameId;
  const [effets, setEffets] = useState<EffetsHorreur>(EFFETS_HORREUR_PAR_DEFAUT);
  const [scare, setScare] = useState<{ id: number; visuel: "oeil" | "visage" } | null>(null);

  const seqRef = useRef(0);
  const scareEnCoursRef = useRef(false);
  const visuelRef = useRef(effets.jumpscare.visuel);
  const lancerRef = useRef<() => void>(() => {});
  // undefined = pas encore reçu l'état initial ; sert à ne pas rejouer un
  // déclenchement manuel qui date d'avant l'ouverture de la page.
  const dernierDeclencheRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    visuelRef.current = effets.jumpscare.visuel;
    lancerRef.current = () => {
      if (scareEnCoursRef.current || !lireEffetsActifs()) return;
      if (document.hidden) return; // personne ne regarde l'écran
      const choix = visuelRef.current;
      const visuel = choix === "alea" ? (Math.random() < 0.5 ? "oeil" : "visage") : choix;
      seqRef.current += 1;
      scareEnCoursRef.current = true;
      setScare({ id: seqRef.current, visuel });
    };
  });

  // Sur mobile le son ne démarre qu'après une interaction : on le débloque au
  // premier tap / clic / touche, bien avant le premier jumpscare.
  useEffect(() => {
    const evenements = ["click", "touchend", "keydown"] as const;
    const debloquer = () => {
      debloquerSon();
      evenements.forEach((e) => window.removeEventListener(e, debloquer));
    };
    evenements.forEach((e) => window.addEventListener(e, debloquer));
    return () => evenements.forEach((e) => window.removeEventListener(e, debloquer));
  }, []);

  // Suit les réglages de l'organisateur en temps réel, et réagit à un
  // déclenchement manuel (nouvel id) en lançant le jumpscare tout de suite.
  useEffect(() => {
    if (!gameId) return;
    dernierDeclencheRef.current = undefined;
    return ecouterEffetsHorreur(gameId, (e) => {
      setEffets(e);
      const id = e.jumpscare.declenche?.id ?? null;
      const precedent = dernierDeclencheRef.current;
      dernierDeclencheRef.current = id;
      if (precedent !== undefined && id && id !== precedent) lancerRef.current();
    });
  }, [gameId]);

  // Apparitions aléatoires, tant que le jumpscare est armé.
  const jumpscareArme = effets.jumpscare.actif;
  const frequence = effets.jumpscare.frequence;
  useEffect(() => {
    if (!jumpscareArme) return;
    let minuteur: ReturnType<typeof setTimeout> | undefined;
    const planifier = (plage: [number, number]) => {
      const delai = plage[0] + Math.random() * (plage[1] - plage[0]);
      minuteur = setTimeout(() => {
        lancerRef.current();
        planifier(PLAGES_MS[frequence]);
      }, delai);
    };
    planifier(PREMIERE_PLAGE_MS);
    return () => {
      if (minuteur) clearTimeout(minuteur);
    };
  }, [jumpscareArme, frequence]);

  // Interface possédée, tant qu'elle est active.
  const possedeActif = effets.possede.actif;
  const retournement = effets.possede.retournement;
  const boutonsFuient = effets.possede.boutonsFuient;
  useEffect(() => {
    if (!possedeActif || !lireEffetsActifs()) return;
    return demarrerPossede({ retournement, boutonsFuient });
  }, [possedeActif, retournement, boutonsFuient]);

  if (!scare) return null;
  return (
    <JumpscareOverlay
      key={scare.id}
      visuel={scare.visuel}
      onFin={() => {
        scareEnCoursRef.current = false;
        setScare(null);
      }}
    />
  );
}
