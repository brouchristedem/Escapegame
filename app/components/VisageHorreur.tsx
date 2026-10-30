// Visage original (pas de personnage existant) : deux yeux rouges fendus et une
// bouche en dents de scie. Utilisé par le jumpscare piloté par l'organisateur
// (voir JumpscareOverlay) ; la taille vient de `className`.
export default function VisageHorreur({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="presentation" aria-hidden="true">
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
  );
}
