import EffetsHorreurJeu from "@/app/components/EffetsHorreurJeu";

// Les écrans de jeu (choix d'équipe, énigmes, suivi) suivent en temps réel les
// effets d'horreur que l'organisateur active depuis l'admin : jumpscare et
// interface possédée. Rien ne s'affiche tant qu'ils sont désactivés.
export default function JouerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EffetsHorreurJeu />
      {children}
    </>
  );
}
