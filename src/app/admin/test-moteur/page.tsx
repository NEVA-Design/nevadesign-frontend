import TestMoteur from './TestMoteur'

export const dynamic = 'force-dynamic'

// La page de test du moteur v2 (run 5.2, LOT 5) — 5 cas pré-câblés,
// chaque prompt compilé s'affiche AVANT lancement, et c'est l'admin qui
// clique. Le layout /admin vérifie déjà la session admin.
export default function TestMoteurPage() {
  return <TestMoteur />
}
