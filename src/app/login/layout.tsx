import type { Metadata } from "next";

/* La page est un Client Component : ses metadata vivent ici.
   Avant le run 3 elle héritait du canonical racine « / ». */
export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous à votre espace Neva Design pour retrouver vos créations, vos crédits et vos exports.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
