"use client";

// Interrupteurs des effets d'horreur, côté organisateur : jumpscare (visuel +
// sonore) et interface possédée. Tout s'active et s'éteint en direct, chez
// tous les joueurs connectés, sans recharger leur page. Affiché dans l'onglet
// « Événements » de l'admin et dans la télécommande.

import { useEffect, useState } from "react";
import {
  declencherJumpscare,
  definirEffetsHorreur,
  ecouterEffetsHorreur,
  toutDesactiverEffetsHorreur,
} from "@/lib/data";
import {
  EFFETS_HORREUR_PAR_DEFAUT,
  EffetsHorreur,
  EffetsHorreurPartiel,
  FrequenceJumpscare,
  RetournementPossede,
  VisuelJumpscare,
} from "@/lib/types";

function Interrupteur({
  actif,
  onChange,
  disabled,
  label,
}: {
  actif: boolean;
  onChange: (suivant: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      onClick={() => onChange(!actif)}
      disabled={disabled}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        actif ? "bg-alerte" : "bg-acier/30"
      }`}
    >
      <span
        className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
          actif ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function EffetsHorreurPanneau({ gameId }: { gameId: string }) {
  const [effets, setEffets] = useState<EffetsHorreur>(EFFETS_HORREUR_PAR_DEFAUT);
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);

  useEffect(() => ecouterEffetsHorreur(gameId, setEffets), [gameId]);

  async function agir(action: () => Promise<void>, ok: string) {
    setOccupe(true);
    setMessage(null);
    try {
      await action();
      setMessage({ ok: true, texte: ok });
    } catch {
      setMessage({ ok: false, texte: "Échec de l'opération. Vérifie ta connexion et tes droits sur ce jeu, puis réessaie." });
    } finally {
      setOccupe(false);
    }
  }

  function regler(partiel: EffetsHorreurPartiel, ok: string) {
    agir(() => definirEffetsHorreur(gameId, partiel), ok);
  }

  const { jumpscare, possede } = effets;
  const quelqueChoseActif = jumpscare.actif || possede.actif;

  const champ = "bg-white border border-acier/20 rounded-lg px-3 py-2 w-full";
  const bouton = "rounded-full px-6 py-2 text-sm font-semibold disabled:opacity-50";

  return (
    <div>
      <h2 className="font-semibold text-nuit mb-2 flex items-center gap-2">
        4. Jumpscare &amp; interface possédée
        {quelqueChoseActif && (
          <span className="rounded-full bg-alerte px-2 py-0.5 text-xs font-semibold text-white">ACTIF</span>
        )}
      </h2>
      <div className="flex flex-col gap-3">
        <div className="bg-brume-clair rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-nuit">👁️ Jumpscare</p>
              <p className="text-sm text-nuit/90">
                L&apos;écran se fige une demi-seconde, puis un visage ou l&apos;œil du logo surgit en plein écran, avec un cri
                ou un bruit de métal lacéré.
              </p>
            </div>
            <Interrupteur
              actif={jumpscare.actif}
              disabled={occupe}
              label="Apparitions aléatoires du jumpscare"
              onChange={(v) =>
                regler({ jumpscare: { actif: v } }, v ? "Jumpscare armé : il surgira au hasard chez les joueurs." : "Jumpscare désactivé.")
              }
            />
          </div>
          <p className="text-xs text-nuit/90">
            {jumpscare.actif
              ? "Armé : chaque joueur aura un jumpscare à un moment imprévisible, de temps en temps."
              : "Désactivé : rien n'apparaît tout seul. Tu peux quand même le déclencher à la main ci-dessous."}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-nuit/90">
              Ce qui surgit
              <select
                value={jumpscare.visuel}
                disabled={occupe}
                onChange={(e) => regler({ jumpscare: { visuel: e.target.value as VisuelJumpscare } }, "Visuel du jumpscare enregistré.")}
                className={`${champ} mt-1`}
              >
                <option value="alea">Au hasard (œil ou visage)</option>
                <option value="oeil">L&apos;œil du logo</option>
                <option value="visage">Un visage</option>
              </select>
            </label>
            <label className="text-xs text-nuit/90">
              Fréquence (apparitions aléatoires)
              <select
                value={jumpscare.frequence}
                disabled={occupe}
                onChange={(e) =>
                  regler({ jumpscare: { frequence: e.target.value as FrequenceJumpscare } }, "Fréquence enregistrée.")
                }
                className={`${champ} mt-1`}
              >
                <option value="rare">Rare (environ toutes les 6 min)</option>
                <option value="normale">Normale (environ toutes les 3 min)</option>
                <option value="frequente">Fréquente (environ toutes les 90 s)</option>
              </select>
            </label>
          </div>
          <button
            onClick={() => agir(() => declencherJumpscare(gameId), "Jumpscare déclenché chez tous les joueurs connectés.")}
            disabled={occupe}
            className={`${bouton} self-start bg-alerte text-white`}
          >
            Déclencher maintenant
          </button>
        </div>

        <div className="bg-brume-clair rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-nuit">🌀 Interface possédée</p>
              <p className="text-sm text-nuit/90">
                Pendant une phase de recherche, le site se retourne lentement et les boutons fuient le curseur : cliquer
                devient un combat.
              </p>
            </div>
            <Interrupteur
              actif={possede.actif}
              disabled={occupe}
              label="Interface possédée"
              onChange={(v) => regler({ possede: { actif: v } }, v ? "Interface possédée activée." : "Interface possédée désactivée.")}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-nuit/90">
              Retournement de la page
              <select
                value={possede.retournement}
                disabled={occupe}
                onChange={(e) =>
                  regler({ possede: { retournement: e.target.value as RetournementPossede } }, "Retournement enregistré.")
                }
                className={`${champ} mt-1`}
              >
                <option value="horizontal">Miroir horizontal</option>
                <option value="vertical">Miroir vertical (à l&apos;envers)</option>
                <option value="aucun">Aucun</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-nuit/90 sm:pt-5">
              <input
                type="checkbox"
                checked={possede.boutonsFuient}
                disabled={occupe}
                onChange={(e) => regler({ possede: { boutonsFuient: e.target.checked } }, "Réglage des boutons enregistré.")}
              />
              Les boutons fuient le curseur (ou le doigt)
            </label>
          </div>
          <p className="text-xs text-nuit/90">
            Pour reprendre la main, l&apos;équipe doit maintenir une touche du clavier (ou poser un 2ᵉ doigt sur l&apos;écran)
            pendant qu&apos;un autre clique : à elle de le deviner. Tant que la touche est tenue, la page se redresse et
            les boutons restent en place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => agir(() => toutDesactiverEffetsHorreur(gameId), "Tout est désactivé chez les joueurs.")}
            disabled={occupe || !quelqueChoseActif}
            className={`${bouton} border border-alerte text-alerte bg-white`}
          >
            Tout désactiver
          </button>
          <p className="text-xs text-nuit/90">
            Les flashs sont limités à 3 par seconde, et les joueurs qui ont coupé les « effets effrayants » sur leur
            appareil ne voient rien. Pense à prévenir ton public.
          </p>
        </div>
        {message && <p className={`text-sm ${message.ok ? "text-green-600" : "text-alerte"}`}>{message.texte}</p>}
      </div>
    </div>
  );
}
