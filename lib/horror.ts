// Effets "horror" déclenchés par les mauvaises réponses : le niveau monte avec
// le nombre d'erreurs d'affilée sur la même étape (remis à zéro à la bonne
// réponse). Les sons sont synthétisés avec Web Audio (aucun fichier à charger,
// léger pour les téléphones d'entrée de gamme).

export type NiveauHorror = 1 | 2 | 3;

// Durée max pendant laquelle un effet reste à l'écran avant de laisser le
// joueur continuer.
export const DUREE_EFFET_MS = 1500;

// Après N erreurs d'affilée, le bouton « Réessayer » se bloque quelques secondes.
export const COOLDOWN_APRES_ERREURS = 3;
export const COOLDOWN_SECONDES = 3;
export const MESSAGE_COOLDOWN = "Il approche…";
// Même attente pour tout le monde (le classement départage les équipes à
// l'heure d'arrivée), mais sans le texte effrayant pour qui a coupé les effets.
export const MESSAGE_COOLDOWN_NEUTRE = "Patiente…";

// Erreurs 1-2 : petit effet · 3-4 : medium · 5 : full horror · 6+ : au hasard
// entre medium et full horror, pour que ça reste une surprise.
export function niveauPourErreurs(erreursSuite: number, hasard: () => number = Math.random): NiveauHorror {
  if (erreursSuite <= 2) return 1;
  if (erreursSuite <= 4) return 2;
  if (erreursSuite === 5) return 3;
  return hasard() < 0.5 ? 2 : 3;
}

// ---------- Réglage « effets effrayants » (par appareil) ----------

const CLE_STOCKAGE = "escapegame-effets-horror";

export function lireEffetsActifs(): boolean {
  try {
    return window.localStorage.getItem(CLE_STOCKAGE) !== "off";
  } catch {
    return true;
  }
}

export function sauverEffetsActifs(actifs: boolean): void {
  try {
    window.localStorage.setItem(CLE_STOCKAGE, actifs ? "on" : "off");
  } catch {
    // Stockage indisponible (navigation privée...) : le choix reste en mémoire.
  }
}

// ---------- Vibration ----------

const MOTIFS_VIBRATION: Record<NiveauHorror, number[]> = {
  1: [40],
  2: [80, 40, 80],
  3: [120, 50, 120, 50, 320],
};

export function vibrer(niveau: NiveauHorror): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(MOTIFS_VIBRATION[niveau]);
    }
  } catch {
    // Vibration non supportée : sans importance.
  }
}

// ---------- Son (Web Audio) ----------

let contexte: AudioContext | null = null;

function getContexte(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!contexte) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      contexte = new Ctor();
    } catch {
      return null;
    }
  }
  if (contexte.state === "suspended") void contexte.resume().catch(() => {});
  return contexte;
}

// Sur mobile, l'audio ne démarre qu'après une interaction : à appeler au
// premier tap / clic / touche pour « débloquer » le son avant la 1re erreur.
export function debloquerSon(): void {
  getContexte();
}

function bruit(c: AudioContext, duree: number): AudioBufferSourceNode {
  const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * duree), c.sampleRate);
  const donnees = buffer.getChannelData(0);
  for (let i = 0; i < donnees.length; i++) donnees[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  source.buffer = buffer;
  return source;
}

function enveloppe(g: GainNode, t0: number, attaque: number, pic: number, fin: number): void {
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(pic, t0 + attaque);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + fin);
}

// Sortie commune : volume plafonné + compresseur, pour qu'un cri ne soit
// jamais violent dans un casque.
function sortie(c: AudioContext, volume: number): GainNode {
  const compresseur = c.createDynamicsCompressor();
  const master = c.createGain();
  master.gain.value = volume;
  master.connect(compresseur);
  compresseur.connect(c.destination);
  return master;
}

function goutte(c: AudioContext, dest: AudioNode, t0: number, f0: number, pic: number): void {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(f0, t0);
  o.frequency.exponentialRampToValueAtTime(f0 * 0.22, t0 + 0.14);
  enveloppe(g, t0, 0.01, pic, 0.18);
  o.connect(g);
  g.connect(dest);
  o.start(t0);
  o.stop(t0 + 0.2);
}

function thump(c: AudioContext, dest: AudioNode, t0: number, f0: number, pic: number): void {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(f0, t0);
  o.frequency.exponentialRampToValueAtTime(f0 * 0.42, t0 + 0.3);
  enveloppe(g, t0, 0.015, pic, 0.34);
  o.connect(g);
  g.connect(dest);
  o.start(t0);
  o.stop(t0 + 0.36);
}

function souffle(c: AudioContext, dest: AudioNode, t0: number, duree: number, freq: number, pic: number): void {
  const source = bruit(c, duree);
  const filtre = c.createBiquadFilter();
  const g = c.createGain();
  filtre.type = "bandpass";
  filtre.frequency.value = freq;
  filtre.Q.value = 0.9;
  enveloppe(g, t0, duree * 0.25, pic, duree);
  source.connect(filtre);
  filtre.connect(g);
  g.connect(dest);
  source.start(t0);
  source.stop(t0 + duree);
}

function cri(c: AudioContext, dest: AudioNode, t0: number): void {
  // Voix : dent de scie qui monte puis retombe, vibrato rapide, filtrée.
  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(520, t0);
  o.frequency.exponentialRampToValueAtTime(1500, t0 + 0.25);
  o.frequency.exponentialRampToValueAtTime(700, t0 + 1.0);

  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 38;
  lfoGain.gain.value = 90;
  lfo.connect(lfoGain);
  lfoGain.connect(o.frequency);

  const filtre = c.createBiquadFilter();
  filtre.type = "bandpass";
  filtre.frequency.value = 1300;
  filtre.Q.value = 1.4;

  const g = c.createGain();
  enveloppe(g, t0, 0.03, 0.7, 1.1);
  o.connect(filtre);
  filtre.connect(g);
  g.connect(dest);

  o.start(t0);
  lfo.start(t0);
  o.stop(t0 + 1.15);
  lfo.stop(t0 + 1.15);

  souffle(c, dest, t0, 1.0, 3200, 0.3);
  thump(c, dest, t0, 62, 0.9);
}

export function jouerSon(niveau: NiveauHorror): void {
  const c = getContexte();
  // Contexte encore bloqué (aucune interaction avant) : on reste silencieux.
  if (!c || c.state !== "running") return;
  const t0 = c.currentTime + 0.01;

  if (niveau === 1) {
    const dest = sortie(c, 0.5);
    goutte(c, dest, t0, 1000, 0.5);
    goutte(c, dest, t0 + 0.32, 760, 0.3);
  } else if (niveau === 2) {
    const dest = sortie(c, 0.6);
    thump(c, dest, t0, 90, 0.9);
    souffle(c, dest, t0 + 0.05, 0.4, 420, 0.35);
    goutte(c, dest, t0 + 0.5, 900, 0.4);
  } else {
    const dest = sortie(c, 0.55);
    cri(c, dest, t0);
  }
}
