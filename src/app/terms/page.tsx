import type { Metadata } from "next";
import LegalPage from "@/components/solutions/LegalPage";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description:
    "Les règles du studio Neva Design : comptes, créations, droits d'usage des visuels et résiliation.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Conditions d'utilisation"
      updated="Version du 14 août 2026"
      sections={[
        {
          heading: "Le service",
          paragraphs: [
            "Neva Design est un studio créatif en ligne : vous décrivez le visuel dont vous avez besoin, le studio le compose et vous l'exportez. Le service est fourni tel quel, avec une obligation de moyens.",
          ],
        },
        {
          heading: "Comptes et créations",
          paragraphs: [
            "L'inscription offre 3 créations, sans carte bancaire. Les abonnements (Creator 24 €/mois, Studio 59 €/mois, Agence 129 €/mois) renouvellent chaque mois un volume de créations ; des recharges à 2,90 € la création sont disponibles à tout moment.",
          ],
          list: [
            "Chaque création inclut 5 retouches ; au-delà, une nouvelle création est décomptée.",
            "Les créations non utilisées sont reportées un mois.",
            "Les paiements sont traités par Stripe ; l'abonnement se résilie en deux clics depuis votre espace de facturation, effet en fin de période.",
          ],
        },
        {
          heading: "Vos visuels, vos droits",
          paragraphs: [
            "Les visuels générés avec un plan payant sont utilisables commercialement. Les créations du plan Découverte sont limitées à un usage non commercial et portent un filigrane de prévisualisation.",
            "Vous restez responsable des contenus que vous soumettez dans vos briefs : n'y placez ni contenu illicite, ni marque ou œuvre dont vous ne détenez pas les droits.",
          ],
        },
        {
          heading: "Usage acceptable",
          paragraphs: [
            "Sont interdits : les contenus illégaux, trompeurs ou portant atteinte aux droits de tiers, ainsi que toute tentative de contourner le décompte des créations ou de perturber le service. Un compte en infraction peut être suspendu après notification.",
          ],
        },
        {
          heading: "Modification des conditions",
          paragraphs: [
            "Ces conditions peuvent évoluer avec le produit ; les changements substantiels sont annoncés sur le site ou par e-mail avant leur entrée en vigueur.",
          ],
        },
      ]}
    />
  );
}
