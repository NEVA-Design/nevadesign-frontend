import type { Metadata } from "next";
import LegalPage from "@/components/solutions/LegalPage";

export const metadata: Metadata = {
  title: "Cookies",
  description:
    "Les cookies et stockages utilisés par Neva Design : uniquement du technique, aucun traceur publicitaire.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies"
      updated="Version du 14 août 2026"
      sections={[
        {
          heading: "Ce que nous utilisons",
          paragraphs: [
            "Neva Design n'embarque ni traceur publicitaire, ni script d'analytics tiers. Le site utilise uniquement des stockages techniques :",
          ],
          list: [
            "Cookies de session (sb-…) : maintiennent votre connexion à votre espace. Posés uniquement si vous vous connectez.",
            "Préférence de langue (neva-locale) : retient votre choix FR/EN, dans le stockage local du navigateur.",
            "Qualité de la scène 3D (neva-scene-tier) : retient le niveau de rendu adapté à votre machine.",
            "Marqueur d'ouverture (prism-overture) : évite de rejouer l'animation d'entrée à chaque page, le temps de la session.",
          ],
        },
        {
          heading: "Ce que cela implique",
          paragraphs: [
            "Ces stockages sont strictement nécessaires au fonctionnement du site ou à votre confort : ils n'exigent pas de bannière de consentement et ne suivent pas votre navigation ailleurs.",
            "Vous pouvez les effacer à tout moment depuis les réglages de votre navigateur ; vous serez simplement déconnecté et vos préférences reviendront aux valeurs par défaut.",
          ],
        },
      ]}
    />
  );
}
