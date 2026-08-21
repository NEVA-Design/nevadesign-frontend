"use client";

/*
 * Transition de pages (REFONTE 50k, §phase 4) — un BALAYAGE noir
 * qui monte du bas (0,3 s), le monogramme filaire au centre, puis
 * le voile se retire vers le haut sur la nouvelle page (0,3 s).
 * Monté UNE fois dans le layout racine (il survit aux navigations).
 * Périmètre : les navigations initiées depuis les surfaces
 * marketing — le produit (dashboard/admin/éditeur) garde ses
 * navigations instantanées.
 */

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PRODUCT_PREFIXES = ["/dashboard", "/admin", "/dev-preview", "/pay", "/auth"];

function isProductPath(path: string) {
  return PRODUCT_PREFIXES.some((p) => path.startsWith(p));
}

export default function PageVeil() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "in" | "out">("idle");
  const pending = useRef<string | null>(null);
  const lastPath = useRef(pathname);

  /* Entrée : intercepte les clics de liens internes inter-pages
     depuis une surface marketing. En phase de CAPTURE : le handler
     React du <Link> Next ferait déjà preventDefault + push avant
     un écouteur bubble — on prend la main avant lui. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.("a");
      if (!a) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href") ?? "";
      if (!href.startsWith("/") || href.startsWith("/#")) return;
      const url = new URL(href, window.location.origin);
      if (url.pathname === window.location.pathname) return;
      if (isProductPath(window.location.pathname)) return;
      e.preventDefault();
      e.stopPropagation();
      pending.current = href;
      setState("in");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  /* Chorégraphie par TIMERS (jamais animationend : les onglets en
     arrière-plan diffèrent les animations CSS — la navigation ne
     doit dépendre d'aucun événement d'animation). */
  useEffect(() => {
    if (state === "in" && pending.current) {
      const nav = window.setTimeout(() => {
        if (pending.current) {
          router.push(pending.current);
          pending.current = null;
        }
      }, 320);
      /* garde-fou : route lente ou en erreur → on libère l'écran */
      const bail = window.setTimeout(() => {
        setState((s) => (s === "in" ? "out" : s));
      }, 2500);
      return () => {
        window.clearTimeout(nav);
        window.clearTimeout(bail);
      };
    }
    if (state === "out") {
      const done = window.setTimeout(() => setState("idle"), 480);
      return () => window.clearTimeout(done);
    }
  }, [state, router]);

  /* La nouvelle page est là → le voile se retire */
  useEffect(() => {
    if (pathname !== lastPath.current) {
      lastPath.current = pathname;
      if (state === "in") {
        window.scrollTo(0, 0);
        setState("out");
      }
    }
  }, [pathname, state]);

  if (state === "idle") return null;

  return (
    <div
      aria-hidden
      className={`pv-veil-page fixed inset-0 z-[220] flex items-center justify-center bg-[#060606] ${
        state === "in" ? "pv-veil-page--in" : "pv-veil-page--out"
      }`}
    >
      {/* Monogramme ΛV filaire — le battement de la maison */}
      <svg
        width="64"
        height="46"
        viewBox="0 0 1441 1000"
        className="opacity-70"
        fill="none"
        stroke="rgba(244,242,238,0.9)"
        strokeWidth="14"
      >
        <path d="M440.2 0 L864.6 1000 L694.6 1000 L441 379 L180.1 1000 L0 1000 Z" />
        <path d="M575 0 L755.1 0 L1013 618 L1266.6 0 L1438.1 0 L1015.2 990 Z" />
      </svg>
    </div>
  );
}
