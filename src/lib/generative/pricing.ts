/*
 * Prix des formules Neva Generative — LA source unique (passe
 * whaou P6.3). Tant qu'une valeur est `null`, l'UI affiche l'état
 * designé « — € /mois » + badge « Accès anticipé — prix bientôt ».
 * Dès que les montants sont connus : remplacer les null ICI (et
 * nulle part ailleurs), tout le site suit.
 */
export type GenerativePlanPricing = {
  /** € / mois — null tant que non annoncé */
  price: number | null;
  /** générations (ou bannières) / mois — null tant que non annoncé */
  quota: number | null;
};

export const GENERATIVE_PRICING: Record<"gta" | "banner", GenerativePlanPricing> = {
  gta: { price: null, quota: null },
  banner: { price: null, quota: null },
};

/** « 12 » → « 12 » ; null → « — » (jamais de TODO dans l'UI) */
export function formatGenerativePrice(p: GenerativePlanPricing): string {
  return p.price === null ? "—" : String(p.price);
}
