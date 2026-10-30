import { useId } from "react";

// Logo de la plateforme : un œil seul, qui regarde. Sclère sombre striée de
// veines, iris bleu glacial à fibres, pupille rouge sang fendue, paupière qui
// l'écrase par le haut. Le nom ESCAPE GAME CI est en lettres fines dessous.
// Il se lit petit dans l'en-tête comme grand dans le hero (la taille vient de
// `className`, appliqué à l'icône). Le logo des pages de jeu (GameLogo) reste
// celui du Gardien.

// Fibres de l'iris, calculées une fois : pas de hasard, donc identiques côté
// serveur et côté navigateur.
const FIBRES = Array.from({ length: 72 }, (_, i) => {
  const a = (2 * Math.PI * i) / 72 + (i % 2 ? 0.03 : 0);
  const r1 = 7.5 + (i % 3) * 0.6;
  const r2 = 19.5 - (i % 4) * 0.9;
  return {
    x1: +(60 + r1 * Math.cos(a)).toFixed(2),
    y1: +(40 + r1 * Math.sin(a)).toFixed(2),
    x2: +(60 + r2 * Math.cos(a)).toFixed(2),
    y2: +(40 + r2 * Math.sin(a)).toFixed(2),
    clair: i % 2 === 0,
  };
});

const CONTOUR = "M6 40 Q60 -2 114 40 Q60 82 6 40 Z";

export default function EscapeLogo({
  className = "w-24",
  nom = true,
  titre = false,
  classeNom = "text-sm",
}: {
  className?: string;
  nom?: boolean;
  titre?: boolean; // true = le nom est le <h1> de la page
  classeNom?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const oeil = `oeil${uid}`;
  const sclere = `sclere${uid}`;
  const iris = `iris${uid}`;
  const pupille = `pupille${uid}`;
  const ombre = `ombre${uid}`;
  const flou = `flou${uid}`;
  const Nom = titre ? "h1" : "span";

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <svg viewBox="0 0 120 80" className={`${className} h-auto`} aria-hidden>
        <defs>
          <clipPath id={oeil}>
            <path d={CONTOUR} />
          </clipPath>
          <radialGradient id={sclere} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#a9b0b8" />
            <stop offset="55%" stopColor="#7c838c" />
            <stop offset="100%" stopColor="#2e0a0e" />
          </radialGradient>
          <radialGradient id={iris} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#bfeaff" />
            <stop offset="45%" stopColor="#5fb4ee" />
            <stop offset="85%" stopColor="#1d5f96" />
            <stop offset="100%" stopColor="#07213a" />
          </radialGradient>
          <radialGradient id={pupille} cx="45%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#ff4a50" />
            <stop offset="55%" stopColor="#b00f1a" />
            <stop offset="100%" stopColor="#3a0306" />
          </radialGradient>
          <linearGradient id={ombre} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0.9" />
            <stop offset="38%" stopColor="#000" stopOpacity="0.35" />
            <stop offset="62%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
          </linearGradient>
          <filter id={flou} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Pli de la paupière */}
        <path d="M4 38 Q60 -16 116 38" fill="none" stroke="#141c2c" strokeWidth="2" opacity="0.7" />

        <g clipPath={`url(#${oeil})`}>
          <rect width="120" height="80" fill={`url(#${sclere})`} />

          {/* Veines aux deux coins */}
          <g fill="none" stroke="#c4121d" strokeLinecap="round" opacity="0.8">
            <path d="M8 40 Q22 38 38 41" strokeWidth="0.6" />
            <path d="M12 36 Q24 34 36 38" strokeWidth="0.4" />
            <path d="M12 45 Q25 44 37 42" strokeWidth="0.4" />
            <path d="M20 38 Q27 32 33 33" strokeWidth="0.3" />
            <path d="M112 40 Q98 38 82 41" strokeWidth="0.6" />
            <path d="M108 36 Q96 34 84 38" strokeWidth="0.4" />
            <path d="M108 45 Q95 44 83 42" strokeWidth="0.4" />
            <path d="M100 39 Q93 46 87 46" strokeWidth="0.3" />
          </g>

          {/* Iris, fibres et anneau sombre */}
          <circle cx="60" cy="40" r="21" fill={`url(#${iris})`} />
          {FIBRES.map((f, i) => (
            <line
              key={i}
              x1={f.x1}
              y1={f.y1}
              x2={f.x2}
              y2={f.y2}
              stroke={f.clair ? "#e9f8ff" : "#0f4a78"}
              strokeWidth="0.35"
              opacity={f.clair ? 0.4 : 0.6}
            />
          ))}
          <circle cx="60" cy="40" r="20.2" fill="none" stroke="#04121f" strokeWidth="2.2" />

          {/* Pupille rouge sang fendue, avec sa lueur qui respire */}
          <ellipse cx="60" cy="40" rx="8" ry="16" fill="#e0242f" filter={`url(#${flou})`} className="lg-pulse" />
          <ellipse cx="60" cy="40" rx="5.2" ry="14" fill={`url(#${pupille})`} />
          <ellipse cx="55.5" cy="32" rx="3" ry="2" fill="#fff" opacity="0.75" />
          <ellipse cx="66" cy="49" rx="1.4" ry="1" fill="#fff" opacity="0.4" />

          {/* Ombre de la paupière sur l'œil */}
          <rect width="120" height="80" fill={`url(#${ombre})`} />
        </g>

        {/* Contour des paupières */}
        <path d={CONTOUR} fill="none" stroke="#02040a" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M10 42 Q60 74 110 42" fill="none" stroke="#8fd3ff" strokeWidth="0.6" opacity="0.5" />
      </svg>
      {nom && (
        <Nom className={`font-headline font-semibold uppercase tracking-[0.32em] text-glace-pale ${classeNom}`}>
          Escape Game CI
        </Nom>
      )}
    </div>
  );
}
