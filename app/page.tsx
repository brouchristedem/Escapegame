"use client";

// Page d'accueil permanente : sombre, bleu glacial pour l'ambiance, rouge sang
// pour la tension. Plus de liste publique de jeux : le joueur tape le code
// donné par son organisateur (unique sur tout le site, voir trouverJeuParCode
// dans lib/data.ts), ou arrive directement par le QR code / le lien du jeu.
// Tarifs et À propos sont accessibles à tous ; l'espace organisateur n'a
// qu'un lien discret en pied de page.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WHATSAPP_NUMERO } from "@/app/components/TarifsCards";
import { trouverJeuParCode } from "@/lib/data";
import EscapeLogo from "@/app/components/EscapeLogo";
import OeilLogo from "@/app/components/OeilLogo";
import Reveal from "@/app/components/gsap/Reveal";

const MAX_TENTATIVES = 3;
const BLOCAGE_MS = 60_000; // 1 minute de blocage après 3 essais ratés
const CLE_VERROU = "escape_verrou_accueil";

interface EtatVerrou {
  tentatives: number;
  bloqueJusqua: number | null;
}

function lireVerrou(): EtatVerrou {
  if (typeof window === "undefined") return { tentatives: 0, bloqueJusqua: null };
  try {
    const brut = window.localStorage.getItem(CLE_VERROU);
    if (!brut) return { tentatives: 0, bloqueJusqua: null };
    return JSON.parse(brut) as EtatVerrou;
  } catch {
    return { tentatives: 0, bloqueJusqua: null };
  }
}

function ecrireVerrou(etat: EtatVerrou) {
  try {
    window.localStorage.setItem(CLE_VERROU, JSON.stringify(etat));
  } catch {}
}

export default function Accueil() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState("");
  const [verifie, setVerifie] = useState(false);
  const [ouverture, setOuverture] = useState(false);
  const [bloqueJusqua, setBloqueJusqua] = useState<number | null>(null);
  const [maintenant, setMaintenant] = useState(() => Date.now());

  // Le verrou vit dans localStorage : on le lit après le montage pour que le
  // rendu serveur et le premier rendu client restent identiques.
  useEffect(() => {
    const etat = lireVerrou();
    if (etat.bloqueJusqua && etat.bloqueJusqua > Date.now()) setBloqueJusqua(etat.bloqueJusqua);
  }, []);

  useEffect(() => {
    if (!bloqueJusqua) return;
    const id = setInterval(() => setMaintenant(Date.now()), 1000);
    return () => clearInterval(id);
  }, [bloqueJusqua]);

  const bloque = bloqueJusqua !== null && bloqueJusqua > maintenant;

  async function rejoindre() {
    if (!code.trim() || verifie || ouverture || bloque) return;
    setVerifie(true);
    setErreur("");
    try {
      const r = await trouverJeuParCode(code);
      if (r.statut === "trouve") {
        ecrireVerrou({ tentatives: 0, bloqueJusqua: null });
        setOuverture(true);
        router.push(`/g/${r.gameId}`);
        return;
      }
      if (r.statut === "ambigu") {
        setErreur("Ce code est partagé par plusieurs jeux. Demandez un nouveau code à votre organisateur.");
        return;
      }
      const tentatives = lireVerrou().tentatives + 1;
      if (tentatives >= MAX_TENTATIVES) {
        const jusqua = Date.now() + BLOCAGE_MS;
        ecrireVerrou({ tentatives: 0, bloqueJusqua: jusqua });
        setMaintenant(Date.now());
        setBloqueJusqua(jusqua);
        setErreur("Trop de tentatives. Réessayez dans une minute.");
      } else {
        ecrireVerrou({ tentatives, bloqueJusqua: null });
        setErreur("Code incorrect.");
      }
    } catch {
      setErreur("Connexion impossible. Vérifiez votre réseau et réessayez.");
    } finally {
      setVerifie(false);
    }
  }

  const lienNav = "px-3 py-1.5 text-glace/80 hover:text-glace-pale transition-colors";

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-abime text-glace-pale">
      {/* Deux lumières qui se disputent la pièce */}
      <div
        aria-hidden
        className="landing-souffle pointer-events-none absolute -bottom-48 -left-48 h-[34rem] w-[34rem] rounded-full bg-sang/40 blur-[120px]"
      />
      <div
        aria-hidden
        className="landing-souffle landing-souffle-2 pointer-events-none absolute -top-48 -right-48 h-[34rem] w-[34rem] rounded-full bg-glace/30 blur-[120px]"
      />

      <header className="relative z-10 flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <Link href="/" aria-label="ESCAPE GAME CI, accueil" className="flex items-center gap-2.5">
          <OeilLogo className="w-9" />
          <span className="hidden sm:inline font-headline text-xs font-semibold uppercase tracking-[0.3em] text-glace-pale">
            Escape Game CI
          </span>
        </Link>
        <nav className="flex items-center text-sm" aria-label="Navigation principale">
          <Link href="/tarifs" className={lienNav}>
            Tarifs
          </Link>
          <Link href="/a-propos" className={lienNav}>
            À propos
          </Link>
        </nav>
      </header>

      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <Reveal y={20}>
          <EscapeLogo className="w-28 sm:w-36" titre nomAnime classeNom="text-lg sm:text-2xl" />
        </Reveal>

        <Reveal delay={0.25}>
          <p className="mt-8 max-w-sm font-headline text-base sm:text-lg text-glace-pale/90 leading-relaxed">
            Quelque chose vous attend.
            <br />À vous de le trouver.
          </p>
        </Reveal>

        <Reveal delay={0.4} className="mt-10 w-full max-w-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              rejoindre();
            }}
            className="flex flex-col gap-3"
          >
            <label htmlFor="code-jeu" className="sr-only">
              Code de votre organisateur
            </label>
            <input
              id="code-jeu"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setErreur("");
              }}
              disabled={bloque || ouverture}
              placeholder="Code de votre organisateur"
              autoComplete="off"
              autoCapitalize="characters"
              className="w-full rounded-xl border border-glace/30 bg-white/5 px-4 py-3 text-center font-codemono text-sm tracking-widest text-glace-pale placeholder:tracking-normal placeholder:text-glace/50 outline-none transition focus:border-glace focus:shadow-[0_0_20px_-4px_rgba(143,211,255,0.6)] disabled:opacity-50"
            />
            <button type="submit" disabled={!code.trim() || verifie || ouverture || bloque} className="btn-sang px-6 py-3 text-sm">
              {ouverture ? "Ouverture..." : verifie ? "..." : "Rejoindre"}
            </button>
            <p role="alert" className="min-h-5 text-sm text-sang-vif">
              {erreur}
            </p>
          </form>
        </Reveal>
      </section>

      <footer className="relative z-10 px-6 pb-8 pt-4 text-center text-xs text-glace/70 space-y-2">
        <p>
          <Link href="/tarifs" className="underline underline-offset-2 hover:text-glace-pale">
            Tarifs
          </Link>{" "}
          ·{" "}
          <Link href="/a-propos" className="underline underline-offset-2 hover:text-glace-pale">
            À propos
          </Link>
        </p>
        <p>
          Service client :{" "}
          <a href="tel:+2250545177571" className="underline underline-offset-2 hover:text-glace-pale">
            +225 05 45 17 75 71
          </a>{" "}
          ·{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-glace-pale"
          >
            WhatsApp
          </a>
        </p>
        <p>
          <Link href="/organisateur" className="text-glace/40 hover:text-glace/80 transition-colors">
            Espace organisateur
          </Link>
        </p>
      </footer>
    </main>
  );
}
