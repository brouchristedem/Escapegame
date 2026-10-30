// Interface « possédée » : pendant que l'effet est actif, les pages de jeu se
// retournent lentement (miroir, via la propriété CSS `scale` sur <main>, voir
// globals.css) et/ou les boutons fuient le curseur. Maintenir une touche du
// clavier (ou poser un 2e doigt sur l'écran) suspend l'effet tant qu'elle est
// tenue : un joueur la tient pendant qu'un autre clique.
//
// Aucune dépendance à React : tout passe par le DOM, et `demarrerPossede`
// renvoie la fonction qui remet la page exactement comme avant.

import type { RetournementPossede } from "./types";

export interface OptionsPossede {
  retournement: RetournementPossede;
  boutonsFuient: boolean;
}

// Seuls les éléments dans <main> sont concernés : le chrono, les messages de
// l'organisateur et les écrans d'événement (hors <main>) restent utilisables.
const CIBLES =
  "main button, main a[href], main [role='button'], main input[type='submit'], main input[type='button']";
const DISTANCE_FUITE_PX = 80; // le bouton s'esquive quand le curseur s'en approche à moins de ça
const SAUT_PX = 130;
const MARGE_PX = 8;
const DUREE_RETOUR_MS = 1300; // doit rester >= à la transition « retour » de globals.css

let minuteurRetour: ReturnType<typeof setTimeout> | null = null;

function enSaisie(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable;
}

// Facteurs d'échelle courants de <main> (-1 = miroir). `scale` calculé vaut
// « none », « -1 1 » ou « -1 ».
function echelle(main: Element): { sx: number; sy: number } {
  const brut = getComputedStyle(main).scale;
  if (!brut || brut === "none") return { sx: 1, sy: 1 };
  const [a, b] = brut.trim().split(/\s+/).map(Number);
  const sx = Number.isFinite(a) ? a : 1;
  const sy = b === undefined ? sx : Number.isFinite(b) ? b : 1;
  return { sx, sy };
}

export function demarrerPossede(options: OptionsPossede): () => void {
  const racine = document.documentElement;
  const reduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  if (minuteurRetour) {
    clearTimeout(minuteurRetour);
    minuteurRetour = null;
  }
  if (options.retournement === "aucun") delete racine.dataset.possede;
  else racine.dataset.possede = options.retournement;

  // ---- Verrou : touche tenue (hors saisie dans un champ) ou 2 doigts posés ----
  const touchesTenues = new Set<string>();
  let doigts = 0;
  let verrouille = false;

  function majVerrou(): void {
    const v = touchesTenues.size > 0 || doigts >= 2;
    if (v === verrouille) return;
    verrouille = v;
    if (v) racine.dataset.possedeVerrou = "1";
    else delete racine.dataset.possedeVerrou;
  }
  function surToucheBas(e: KeyboardEvent): void {
    if (enSaisie()) return; // taper sa réponse ne doit pas déclencher le verrou
    touchesTenues.add(e.code || e.key);
    majVerrou();
  }
  function surToucheHaut(e: KeyboardEvent): void {
    touchesTenues.delete(e.code || e.key);
    majVerrou();
  }
  function surDoigts(e: TouchEvent): void {
    doigts = e.touches.length;
    majVerrou();
  }
  function surPerteFocus(): void {
    touchesTenues.clear();
    doigts = 0;
    majVerrou();
  }

  // ---- Boutons qui fuient ----
  // Décalage appliqué via la propriété `translate` (indépendante de `transform`,
  // donc sans conflit avec les classes Tailwind). On garde les valeurs inline
  // d'origine pour tout remettre à la fin.
  const deplaces = new Map<HTMLElement, { x: number; y: number; translate: string; transition: string }>();
  let dernierBlocage: { el: Element; at: number } | null = null;

  function fuir(el: HTMLElement, px: number, py: number): void {
    const main = el.closest("main");
    if (!main) return;
    const { sx, sy } = echelle(main);
    // En plein retournement l'échelle passe par ~0 : on attend qu'elle se stabilise.
    if (Math.abs(sx) < 0.3 || Math.abs(sy) < 0.3) return;

    const etat = deplaces.get(el) ?? { x: 0, y: 0, translate: el.style.translate, transition: el.style.transition };
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Position sans décalage, à l'écran (le décalage local est multiplié par l'échelle du parent).
    const baseGauche = r.left - etat.x * sx;
    const baseHaut = r.top - etat.y * sy;
    const maxGauche = Math.max(MARGE_PX, vw - r.width - MARGE_PX);
    const maxHaut = Math.max(MARGE_PX, vh - r.height - MARGE_PX);

    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const depart = Math.atan2(cy - py, cx - px);
    let meilleur = { gauche: r.left, haut: r.top, distance: -1 };
    // On essaie l'opposé du curseur, puis des directions de plus en plus de côté :
    // un bouton acculé contre un bord part dans la direction qui l'éloigne le plus.
    for (const pas of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6]) {
      const a = depart + (pas * Math.PI) / 6;
      const gauche = Math.min(Math.max(r.left + Math.cos(a) * SAUT_PX, MARGE_PX), maxGauche);
      const haut = Math.min(Math.max(r.top + Math.sin(a) * SAUT_PX, MARGE_PX), maxHaut);
      const distance = Math.hypot(gauche + r.width / 2 - px, haut + r.height / 2 - py);
      if (distance > meilleur.distance + 1) meilleur = { gauche, haut, distance };
    }

    const x = (meilleur.gauche - baseGauche) / sx;
    const y = (meilleur.haut - baseHaut) / sy;
    el.style.transition = reduit ? "none" : "translate 0.18s ease-out";
    el.style.translate = `${x}px ${y}px`;
    deplaces.set(el, { x, y, translate: etat.translate, transition: etat.transition });
  }

  let enAttente = false;
  let pointeur = { x: 0, y: 0 };
  function fuirProches(): void {
    enAttente = false;
    if (verrouille) return;
    document.querySelectorAll<HTMLElement>(CIBLES).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const dx = Math.max(r.left - pointeur.x, 0, pointeur.x - r.right);
      const dy = Math.max(r.top - pointeur.y, 0, pointeur.y - r.bottom);
      if (Math.hypot(dx, dy) < DISTANCE_FUITE_PX) fuir(el, pointeur.x, pointeur.y);
    });
  }
  function surPointeurMouvement(e: PointerEvent): void {
    if (e.pointerType !== "mouse" || verrouille) return;
    pointeur = { x: e.clientX, y: e.clientY };
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame(fuirProches);
  }
  // Au doigt (ou si la souris est plus rapide que le bouton) : le bouton s'esquive
  // au lieu de recevoir l'appui, et le clic qui suivrait est annulé.
  function surPointeurBas(e: PointerEvent): void {
    if (verrouille) return;
    const cible = (e.target as Element | null)?.closest?.(CIBLES) as HTMLElement | null | undefined;
    if (!cible) return;
    fuir(cible, e.clientX, e.clientY);
    dernierBlocage = { el: cible, at: Date.now() };
  }
  function surClic(e: MouseEvent): void {
    if (!dernierBlocage || Date.now() - dernierBlocage.at > 800) return;
    const cible = (e.target as Element | null)?.closest?.(CIBLES);
    if (cible && cible === dernierBlocage.el) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  window.addEventListener("keydown", surToucheBas, true);
  window.addEventListener("keyup", surToucheHaut, true);
  window.addEventListener("blur", surPerteFocus);
  window.addEventListener("touchstart", surDoigts, { passive: true });
  window.addEventListener("touchend", surDoigts, { passive: true });
  window.addEventListener("touchcancel", surDoigts, { passive: true });
  if (options.boutonsFuient) {
    window.addEventListener("pointermove", surPointeurMouvement, { passive: true });
    window.addEventListener("pointerdown", surPointeurBas, true);
    window.addEventListener("click", surClic, true);
  }

  return () => {
    window.removeEventListener("keydown", surToucheBas, true);
    window.removeEventListener("keyup", surToucheHaut, true);
    window.removeEventListener("blur", surPerteFocus);
    window.removeEventListener("touchstart", surDoigts);
    window.removeEventListener("touchend", surDoigts);
    window.removeEventListener("touchcancel", surDoigts);
    window.removeEventListener("pointermove", surPointeurMouvement);
    window.removeEventListener("pointerdown", surPointeurBas, true);
    window.removeEventListener("click", surClic, true);

    deplaces.forEach((etat, el) => {
      el.style.translate = etat.translate;
      el.style.transition = etat.transition;
    });
    deplaces.clear();
    delete racine.dataset.possedeVerrou;

    // Le retournement se défait en douceur avant que l'attribut ne disparaisse.
    if (racine.dataset.possede) {
      racine.dataset.possede = "retour";
      minuteurRetour = setTimeout(() => {
        delete racine.dataset.possede;
        minuteurRetour = null;
      }, DUREE_RETOUR_MS);
    }
  };
}
