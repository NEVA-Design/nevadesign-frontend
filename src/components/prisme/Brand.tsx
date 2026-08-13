import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/*
 * Marque Neva Design — monogramme officiel + wordmark Geist.
 * Deux encres : "white" (défaut) vit sur les fonds sombres du produit,
 * "ink" est la version noire réservée aux surfaces claires de la
 * galerie (nav, footer, loader).
 */
export function BrandMark({
  size = 28,
  tone = "white",
  className,
}: {
  size?: number;
  tone?: "white" | "ink";
  className?: string;
}) {
  return (
    <Image
      src={tone === "ink" ? "/brand/logo-noir.png" : "/brand/logo-blanc.png"}
      alt="Neva Design"
      width={Math.round(size * 1.44)}
      height={size}
      className={cn("select-none", className)}
      preload
    />
  );
}

export function Brand({
  href = "/",
  size = 22,
  wordmark = true,
  tone = "white",
  sub,
  className,
}: {
  href?: string | null;
  size?: number;
  wordmark?: boolean;
  tone?: "white" | "ink";
  sub?: string;
  className?: string;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <BrandMark size={size} tone={tone} />
      {wordmark ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-semibold tracking-[-0.02em]",
              tone === "ink" ? "text-ink" : "text-white"
            )}
            style={{ fontSize: Math.round(size * 0.78) }}
          >
            Neva Design
          </span>
          {sub ? (
            <span className="pv-label mt-1.5" style={{ fontSize: 9 }}>
              {sub}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="Neva Design — accueil" className="inline-flex">
      {content}
    </Link>
  );
}
