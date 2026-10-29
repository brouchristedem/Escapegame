"use client";

// Éditeur du formulaire d'inscription d'un jeu : l'organisateur ajoute ses
// propres champs en texte libre (obligatoires ou non) et en désigne un seul
// comme critère de mélange pour la formation des équipes. Sans champ
// personnalisé, le formulaire par défaut (prénom + niveau d'étude) reste en place. Voir ChampInscription dans lib/types.ts.

import { useEffect, useState } from "react";
import { getQuizConfig, saveQuizConfig } from "@/lib/data";
import { ChampInscription } from "@/lib/types";

const MAX_CHAMPS = 6;

interface ChampBrouillon {
  id: string;
  label: string;
  type: "texte" | "choix";
  optionsTexte: string; // une option par ligne
  obligatoire: boolean;
}

function versBrouillon(c: ChampInscription): ChampBrouillon {
  return {
    id: c.id,
    label: c.label,
    type: "texte", // le formulaire n'offre que du texte libre
    optionsTexte: (c.options ?? []).join("\n"),
    obligatoire: c.obligatoire,
  };
}

function nouvelId(): string {
  return `c${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

export default function FormulaireInscription({ gameId }: { gameId: string }) {
  const [champs, setChamps] = useState<ChampBrouillon[]>([]);
  const [melangeId, setMelangeId] = useState<string | null>(null);
  const [charge, setCharge] = useState(false);
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);

  useEffect(() => {
    getQuizConfig(gameId)
      .then((c) => {
        setChamps((c.champsInscription ?? []).map(versBrouillon));
        setMelangeId(c.champMelangeId ?? null);
      })
      .catch(() => {})
      .finally(() => setCharge(true));
  }, [gameId]);

  const personnalise = champs.length > 0;

  function maj(id: string, patch: Partial<ChampBrouillon>) {
    setChamps((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    setMessage(null);
  }

  function ajouter() {
    if (champs.length >= MAX_CHAMPS) return;
    setChamps((prev) => [...prev, { id: nouvelId(), label: "", type: "texte", optionsTexte: "", obligatoire: true }]);
    setMessage(null);
  }

  function supprimer(id: string) {
    setChamps((prev) => prev.filter((c) => c.id !== id));
    if (melangeId === id) setMelangeId(null);
    setMessage(null);
  }

  function personnaliser() {
    // Point de départ : le formulaire par défaut, que l'organisateur adapte.
    setChamps([{ id: nouvelId(), label: "Niveau d'étude", type: "texte", optionsTexte: "", obligatoire: true }]);
    setMessage(null);
  }

  function pointDeDepartMelange(id: string) {
    setMelangeId(id);
    setMessage(null);
  }

  async function retablir() {
    if (!window.confirm("Rétablir le formulaire par défaut (prénom + niveau d'étude) ? Tes champs personnalisés seront supprimés.")) {
      return;
    }
    setOccupe(true);
    setMessage(null);
    try {
      await saveQuizConfig(gameId, { champsInscription: [], champMelangeId: null });
      setChamps([]);
      setMelangeId(null);
      setMessage({ ok: true, texte: "Formulaire par défaut rétabli (prénom + niveau d'étude)." });
    } catch {
      setMessage({ ok: false, texte: "Échec de l'enregistrement. Vérifie ta connexion et tes droits sur ce jeu." });
    } finally {
      setOccupe(false);
    }
  }

  async function enregistrer() {
    const finals: ChampInscription[] = [];
    for (const c of champs) {
      const label = c.label.trim();
      if (!label) {
        setMessage({ ok: false, texte: "Chaque champ doit avoir un intitulé." });
        return;
      }
      finals.push({ id: c.id, label: label.slice(0, 60), type: "texte", obligatoire: c.obligatoire });
    }
    const melangeValide = melangeId && finals.some((c) => c.id === melangeId) ? melangeId : null;
    setOccupe(true);
    setMessage(null);
    try {
      await saveQuizConfig(gameId, { champsInscription: finals, champMelangeId: finals.length ? melangeValide : null });
      setMelangeId(melangeValide);
      setMessage({
        ok: true,
        texte: finals.length
          ? "Formulaire enregistré. Il s'applique aux prochaines inscriptions."
          : "Formulaire par défaut rétabli (prénom + niveau d'étude).",
      });
    } catch {
      setMessage({ ok: false, texte: "Échec de l'enregistrement. Vérifie ta connexion et tes droits sur ce jeu." });
    } finally {
      setOccupe(false);
    }
  }

  const champSaisie = "w-full bg-white border border-acier/20 rounded-lg px-3 py-2 text-sm text-nuit";
  const bouton = "rounded-full bg-lueur px-6 py-2 text-sm font-semibold text-nuit disabled:opacity-50";
  const boutonSecondaire = "rounded-full border border-acier/30 px-5 py-2 text-sm text-nuit disabled:opacity-50";

  if (!charge) return <div className="h-24 rounded-xl bg-acier/10 animate-pulse" />;

  return (
    <div className="bg-brume-clair rounded-xl p-4 flex flex-col gap-4">
      {!personnalise ? (
        <>
          <p className="text-sm text-nuit/90">
            Formulaire par défaut : <strong>prénom</strong> + <strong>niveau d&apos;étude</strong> (qui sert à équilibrer les
            équipes). Tu peux le remplacer par tes propres champs : « Service », « Classe », « Ancienneté »...
          </p>
          <div>
            <button onClick={personnaliser} className={bouton}>
              Personnaliser le formulaire
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-nuit/90">
            Le prénom est toujours demandé. Ajoute jusqu&apos;à {MAX_CHAMPS} champs en texte libre, puis désigne celui qui
            sert de <strong>critère de mélange</strong> : les équipes auront un profil équilibré sur ce champ. Pour le
            critère, indique les réponses attendues dans l&apos;intitulé (ex. « Classe : L1, L2 ou L3 ») afin que tout
            le monde écrive pareil.
          </p>

          <ul className="flex flex-col gap-3">
            {champs.map((c, i) => (
              <li key={c.id} className="rounded-lg bg-white/70 ring-1 ring-acier/15 p-3 flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={c.label}
                    onChange={(e) => maj(c.id, { label: e.target.value })}
                    maxLength={60}
                    placeholder={`Champ ${i + 1} (ex. Service)`}
                    aria-label={`Intitulé du champ ${i + 1}`}
                    className={champSaisie}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-nuit">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={c.obligatoire}
                      onChange={(e) => maj(c.id, { obligatoire: e.target.checked })}
                    />
                    Obligatoire
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name={`melange-${gameId}`}
                      checked={melangeId === c.id}
                      onChange={() => pointDeDepartMelange(c.id)}
                    />
                    Critère de mélange
                  </label>
                  <button onClick={() => supprimer(c.id)} className="text-alerte underline text-xs ml-auto">
                    Supprimer ce champ
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <label className="inline-flex items-center gap-2 text-sm text-nuit">
            <input
              type="radio"
              name={`melange-${gameId}`}
              checked={melangeId === null}
              onChange={() => setMelangeId(null)}
            />
            Aucun critère : tirage purement aléatoire
          </label>

          <div className="flex flex-wrap gap-2">
            <button onClick={ajouter} disabled={champs.length >= MAX_CHAMPS} className={boutonSecondaire}>
              + Ajouter un champ
            </button>
            <button onClick={enregistrer} disabled={occupe} className={bouton}>
              {occupe ? "Enregistrement..." : "Enregistrer le formulaire"}
            </button>
            <button onClick={retablir} disabled={occupe} className={boutonSecondaire}>
              Rétablir le formulaire par défaut
            </button>
          </div>
          <p className="text-xs text-nuit/90">
            Les changements ne touchent pas les inscriptions déjà reçues. Pense à les faire avant d&apos;ouvrir les
            inscriptions.
          </p>
        </>
      )}
      {message && <p className={`text-sm ${message.ok ? "text-green-600" : "text-alerte"}`}>{message.texte}</p>}
    </div>
  );
}
