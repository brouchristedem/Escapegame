// Couleur d'un chrono qui passe du bleu au rouge à mesure que le temps baisse :
// le bleu est le calme avant la tempête, le rouge la tension. En dessous du
// seuil critique, les pages basculent sur le rouge plein qui pulse
// (animate-timer-critical) ; ce dégradé couvre la descente qui y mène.

export type RGB = [number, number, number];

export const GLACE: RGB = [143, 211, 255]; // bleu glacial (chrono sur fond sombre)
export const SANG_VIF: RGB = [224, 36, 47]; // rouge sang (chrono sur fond sombre)
export const ACIER: RGB = [33, 73, 127]; // bleu acier (chrono sur fond clair)
export const ALERTE: RGB = [179, 36, 27]; // rouge sang (chrono sur fond clair)

// 0 = encore calme (>= debut secondes restantes), 1 = pleinement tendu (<= fin).
export function progression(secondes: number, debut: number, fin: number): number {
  if (debut <= fin) return secondes <= fin ? 1 : 0;
  return Math.min(1, Math.max(0, (debut - secondes) / (debut - fin)));
}

export function couleurEntre(a: RGB, b: RGB, t: number): string {
  const m = (i: number) => Math.round(a[i] + (b[i] - a[i]) * t);
  return `rgb(${m(0)}, ${m(1)}, ${m(2)})`;
}

// Couleur du chrono selon le temps restant, entre deux teintes.
export function couleurChrono(secondes: number, debut: number, fin: number, calme: RGB, tendu: RGB): string {
  return couleurEntre(calme, tendu, progression(secondes, debut, fin));
}
