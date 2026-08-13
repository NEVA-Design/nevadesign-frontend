"use client";

import SmoothScroll from "@/components/prisme/SmoothScroll";

/*
 * Enveloppe des surfaces marketing Prisme : smooth scroll Lenis,
 * scroll natif partout ailleurs. Pas de curseur custom — la retenue
 * est la signature.
 */
export default function PrismShell({ children }: { children: React.ReactNode }) {
  return <SmoothScroll>{children}</SmoothScroll>;
}
