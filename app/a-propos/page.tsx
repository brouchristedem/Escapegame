import Image from "next/image";
import Link from "next/link";
import { WHATSAPP_NUMERO } from "@/app/components/TarifsCards";
import Reveal from "@/app/components/gsap/Reveal";
import SplitReveal from "@/app/components/gsap/SplitReveal";
import Parallax from "@/app/components/gsap/Parallax";


const PORTFOLIO_URL = "https://portfolio-christedem.vercel.app";

export default async function AProposDuDeveloppeur({
  searchParams,
}: {
  searchParams: Promise<{ jeu?: string }>;
}) {
  // Si on arrive depuis la page de jeu (lien avec ?jeu=<gameId>), le retour
  // doit ramener à l'accueil du jeu, jamais à l'espace organisateur : un
  // joueur ne doit pas voir/pouvoir accéder à cet espace depuis cette page.
  const { jeu } = await searchParams;
  const retourHref = jeu ? `/g/${jeu}` : "/";

  return (
    <main className="theme-abime relative min-h-screen bg-brume px-6 py-12 overflow-hidden">
      <Parallax speed={-60} className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-lueur/30 blur-3xl" />
      <Parallax speed={70} className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-lueur/25 blur-3xl" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <Link href={retourHref} className="text-sm text-acier underline">
          ← Retour à l&apos;accueil
        </Link>

        <div className="mt-8 flex flex-col items-center text-center">

          <Reveal>
            <Image
              src="/edem.jpg"
              alt="Christ Edem"
              width={400}
              height={400}
              className="w-40 h-40 rounded-full object-cover ring-4 ring-acier/30 shadow-[0_18px_40px_-14px_rgba(8,16,40,0.45)]"
              priority
            />
          </Reveal>

          <SplitReveal
            as="h1"
            text="Christ Edem BROU"
            type="words"
            className="font-headline mt-5 text-2xl font-bold text-nuit"
          />
          <Reveal delay={0.2}>
            <p className="text-acier font-medium text-sm mt-1">
              Étudiant en Licence 3 Logistique à Abidjan
            </p>
            <p className="text-nuit/80 text-sm mt-1">Développeur web · Applications et plateformes SaaS</p>
          </Reveal>
        </div>

        <Reveal
          as="section"
          stagger
          staggerAmount={0.15}
          className="cadre mt-10 bg-dalle rounded-2xl ring-1 ring-acier/25 shadow-[0_18px_40px_-14px_rgba(8,16,40,0.45)] p-6 text-nuit/90 leading-relaxed space-y-4"
        >
          <p>
            Je suis développeur web et étudiant en Licence 3 Logistique à Abidjan. Je conçois des plateformes
            numériques simples et utiles, à la croisée de la technologie et de la logistique.
          </p>
          <p>
            ESCAPE GAME CI permet d&apos;organiser des escape games en équipe, jouables directement depuis un
            téléphone. Elle s&apos;adresse aux écoles, aux associations et aux groupes d&apos;amis qui
            souhaitent animer un événement, renforcer la cohésion et stimuler la réflexion collective.
            Chaque organisateur peut créer son propre jeu et le partager en quelques instants.
          </p>
          <p>
            Vous souhaitez créer votre propre jeu sur cette plateforme ?{" "}
            <Link href="/tarifs" className="text-acier-deep underline font-semibold">
              Voir les tarifs
            </Link>
            .
          </p>
          <p>
            Du même développeur :{" "}
            <a
              href="https://moncvproci.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-acier-deep underline font-semibold"
            >
              MON CV PRO CI
            </a>
            , un créateur de CV professionnel en ligne : 15 modèles, aperçu avant paiement, scanner ATS
            gratuit, export PDF et paiement Mobile Money.
          </p>
        </Reveal>

        <Reveal as="section" className="mt-6 flex flex-wrap gap-3 justify-center">
          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-lueur to-lueur-fonce text-nuit font-semibold text-sm px-5 py-2.5 rounded-full shadow-md shadow-acier/20 transition hover:-translate-y-0.5"
          >
            WhatsApp
          </a>
          <a
            href="tel:+2250545177571"
            className="bg-dalle ring-1 ring-acier/30 text-nuit font-semibold text-sm px-5 py-2.5 rounded-full shadow-md transition hover:-translate-y-0.5"
          >
            Appeler
          </a>
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-dalle ring-1 ring-acier/30 text-nuit font-semibold text-sm px-5 py-2.5 rounded-full shadow-md transition hover:-translate-y-0.5"
          >
            Mon portfolio
          </a>
        </Reveal>
        <p className="relative z-10 mt-8 text-center text-xs text-nuit/80">Un site Edem Digital Group</p>
      </div>
    </main>
  );
}
