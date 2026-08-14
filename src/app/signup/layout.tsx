import type { Metadata } from "next";

/* La page est un Client Component : ses metadata vivent ici.
   Avant le run 3 elle héritait du canonical racine « / ». */
export const metadata: Metadata = {
  title: "Créer un compte — 3 créations offertes",
  description:
    "Créez votre compte Neva Design gratuitement : 3 créations offertes, sans carte bancaire. Miniatures, logos, identités et assets gaming en quelques minutes.",
  alternates: {
    canonical: "/signup",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
