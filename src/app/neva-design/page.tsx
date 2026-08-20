import type { Metadata } from "next";
import { readdir } from "fs/promises";
import path from "path";
import NevaDesignPage from "@/components/neva-design/NevaDesignPage";
import { DEFAULT_NEVA_DESIGN_PORTFOLIO, type NevaDesignPortfolioItem } from "@/lib/neva-design-portfolio";
import { siteUrl } from "@/lib/seo";
import { BACKEND_URL } from "@/lib/api/backend-server";

const title = "Neva Design - Studio graphique premium pour serveurs FiveM";
const description =
  "Neva Design crée logos, branding, affiches, bannières, landing pages, visuels Discord et packs GFX premium pour les serveurs FiveM ambitieux.";

/* ISR (run 3) : la vitrine était force-dynamic — readdir + Supabase
   à CHAQUE visite, TTFB ~200 ms et page exclue du prerender. Le
   portfolio bouge rarement : servie statique, re-générée au plus
   toutes les heures, et revalidatePath("/neva-design") est appelé
   par les mutations admin du portfolio. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/neva-design",
  },
  keywords: [
    "Neva Design",
    "studio design FiveM",
    "logo FiveM",
    "branding serveur FiveM",
    "affiche GTA RP",
    "banniere Discord FiveM",
    "landing page FiveM",
    "pack GFX FiveM",
    "identite visuelle serveur RP",
  ],
  openGraph: {
    title,
    description,
    url: `${siteUrl}/neva-design`,
    siteName: "Neva Design",
    images: [
      {
        url: "/brand/og.jpg",
        width: 1200,
        height: 630,
        alt: "Neva Design - studio graphique premium FiveM",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/brand/og.jpg"],
  },
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

/* D51 — les pièces portent un vrai nom de projet, plus jamais un
   nom de fichier brut. Table éditoriale (nommée d'après l'œuvre) ;
   titleFromFilename ne sert que de filet aux fichiers inconnus. */
const PIECE_TITLES: Record<string, string> = {
  "EFINAL.webp": "E Final — emblème esport",
  "krlogo.webp": "KR — monogramme chrome",
  "logo.webp": "EV — wordmark esport",
  "logobg.webp": "S Dragon — emblème doré",
  "logotbnnn.webp": "TBN — écusson New York",
  "ocen.webp": "Ocen — emblème floral",
  "vulcainlogo.webp": "Vulcain — V ailé",
  "worldlogo.webp": "World — anneau cinétique",
  "Xlogo.webp": "X — monogramme chrome",
};

function titleFromFilename(filename: string) {
  const named = PIECE_TITLES[filename];
  if (named) return named;
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

type PublicPortfolioFolder = "logos" | "packs" | "branding" | "affiches";

const PUBLIC_FOLDER_CONFIG: Record<
  PublicPortfolioFolder,
  {
    category: NevaDesignPortfolioItem["category"];
    tag: string;
    description: string;
    priority: number;
  }
> = {
  packs: {
    category: "Packs",
    tag: "Pack GFX",
    description: "Pack GFX premium pour présenter un serveur FiveM.",
    priority: 400,
  },
  logos: {
    category: "Logos",
    tag: "Logo",
    description: "Logo serveur FiveM préservé dans ses proportions.",
    priority: 300,
  },
  branding: {
    category: "Branding",
    tag: "Branding",
    description: "Direction visuelle premium pour identité de serveur.",
    priority: 200,
  },
  affiches: {
    category: "Affiches",
    tag: "Affiche",
    description: "Affiche premium pour lancement, teasing ou communication de serveur.",
    priority: 100,
  },
};

async function readPublicPortfolioFolder(folder: PublicPortfolioFolder): Promise<NevaDesignPortfolioItem[]> {
  const directory = path.join(process.cwd(), "public", "neva-design", folder);
  const config = PUBLIC_FOLDER_CONFIG[folder];

  try {
    const files = await readdir(directory);
    return files
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
      .map((file, index) => {
        return {
          id: `public-${folder}-${file}`,
          title: folder === "packs" ? `Pack serveur ${String(index + 1).padStart(2, "0")}` : titleFromFilename(file),
          category: config.category,
          tag: config.tag,
          image_path: `/neva-design/${folder}/${encodeURIComponent(file)}`,
          description: config.description,
          is_featured: false,
          is_active: true,
          priority: config.priority - index,
          layout: "normal",
          created_at: "",
          updated_at: "",
        } satisfies NevaDesignPortfolioItem;
      });
  } catch {
    return [];
  }
}

async function getLocalPortfolioItems() {
  const [packs, logos, branding, affiches] = await Promise.all([
    readPublicPortfolioFolder("packs"),
    readPublicPortfolioFolder("logos"),
    readPublicPortfolioFolder("branding"),
    readPublicPortfolioFolder("affiches"),
  ]);
  return [...packs, ...logos, ...branding, ...affiches].sort((a, b) => b.priority - a.priority);
}

function mergePortfolioItems(primary: NevaDesignPortfolioItem[], fallback: NevaDesignPortfolioItem[]) {
  const seen = new Set(primary.map((item) => item.image_path).filter(Boolean));
  return [...primary, ...fallback.filter((item) => !item.image_path || !seen.has(item.image_path))];
}

export default function Page() {
  async function getPortfolioItems(): Promise<NevaDesignPortfolioItem[]> {
    const localItems = await getLocalPortfolioItems();
    const fallbackItems = localItems.length ? localItems : DEFAULT_NEVA_DESIGN_PORTFOLIO;

    try {
      const res = await fetch(`${BACKEND_URL}/portfolio`, { next: { revalidate: 3600 } });
      if (!res.ok) return fallbackItems;
      const data = (await res.json()) as { items: NevaDesignPortfolioItem[] };
      return data.items.length ? mergePortfolioItems(data.items, fallbackItems) : fallbackItems;
    } catch (error) {
      console.error("[neva-design] portfolio fallback:", error);
      return fallbackItems;
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Neva Design",
    url: `${siteUrl}/neva-design`,
    image: `${siteUrl}/brand/og.jpg`,
    description,
    areaServed: "France",
    serviceType: [
      "Logo Design FiveM",
      "Branding serveur FiveM",
      "Affiches et bannieres",
      "Landing pages",
      "Packs GFX",
    ],
  };

  return (
    <>
      {/* Givre impose sa lumière à la route : fond clair jusque
          sous l'overscroll, scrollbars et contrôles natifs clairs. */}
      <style>{`html{color-scheme:dark}body{background-color:#060606;color:#F2F2F0}`}</style>
      <main className="pv-light min-h-screen text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PortfolioLoader getPortfolioItems={getPortfolioItems} />
      </main>
    </>
  );
}

async function PortfolioLoader({
  getPortfolioItems,
}: {
  getPortfolioItems: () => Promise<NevaDesignPortfolioItem[]>;
}) {
  const portfolioItems = await getPortfolioItems();
  return <NevaDesignPage initialPortfolioItems={portfolioItems} />;
}
