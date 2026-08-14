import type { Metadata } from "next";
import LegalPage from "@/components/solutions/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Quelles données Neva Design collecte, pourquoi, combien de temps — et comment exercer vos droits.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updated="Version du 14 août 2026"
      sections={[
        {
          heading: "Ce que nous collectons",
          paragraphs: [
            "Neva Design collecte le strict nécessaire au fonctionnement du studio :",
          ],
          list: [
            "Votre compte : adresse e-mail, nom d'affichage, avatar éventuel.",
            "Votre activité de création : les briefs que vous saisissez, les visuels générés et votre historique.",
            "Votre facturation : gérée par Stripe — nous ne stockons jamais votre numéro de carte.",
            "Des données techniques de session (cookies d'authentification).",
          ],
        },
        {
          heading: "Ce que nous en faisons",
          paragraphs: [
            "Ces données servent à fournir le service : générer vos créations, tenir votre bibliothèque, décompter vos créations disponibles et vous facturer. Vos briefs et visuels ne sont ni revendus, ni utilisés à des fins publicitaires.",
            "Nos sous-traitants techniques : Supabase (base de données et authentification), Stripe (paiement), et les fournisseurs de modèles d'IA qui exécutent les générations. Chacun ne reçoit que ce dont il a besoin.",
          ],
        },
        {
          heading: "Combien de temps",
          paragraphs: [
            "Vos données de compte sont conservées tant que le compte existe. À la suppression du compte, elles sont effacées ; les pièces comptables sont conservées le temps des obligations légales.",
          ],
        },
        {
          heading: "Vos droits",
          paragraphs: [
            "Conformément au RGPD, vous pouvez demander l'accès, la rectification, la portabilité ou la suppression de vos données à tout moment en écrivant à nevapro@nevadesign.fr. Nous répondons sous 30 jours.",
          ],
        },
      ]}
    />
  );
}
