"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Badge,
  BriefcaseBusiness,
  Download,
  FileBadge,
  IdCard,
  ScanFace,
  Shield,
  Upload,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormMessage, Input, Label, Textarea } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";
import { readApiResponse } from "@/lib/api/client";
import { backendFetch } from "@/lib/api/backend-client";
import { usePrompt } from "@/components/ui/confirm-dialog";

/*
 * Character — le bureau des identités : la table d'examen du dossier à
 * gauche, le panneau de composition numéroté à droite. L'identité du
 * personnage est la matière première, violet la seule lumière.
 */

type SourceImage = { data: string; mimeType: string; preview: string };
type SavedCharacter = { id: string; name: string; description?: string; image_preview?: string | null; role?: string | null; server?: string | null; style?: string | null };
type CharacterAssetType =
  | "rp_identity_card"
  | "passport"
  | "driver_license"
  | "criminal_record"
  | "police_file"
  | "employee_file"
  | "business_profile"
  | "character_poster"
  | "studio_portrait";

type AssetOption = {
  id: CharacterAssetType;
  label: string;
  description: string;
  icon: typeof IdCard;
};

/* Les libellés sont affichés à l'écran uniquement — seul l'id part vers l'API. */
const ASSETS: AssetOption[] = [
  { id: "rp_identity_card", label: "Carte d'identité RP", description: "Profil civil du personnage", icon: IdCard },
  { id: "passport", label: "Passeport", description: "Document de voyage RP fictif", icon: FileBadge },
  { id: "driver_license", label: "Permis de conduire", description: "Carte de conduite en jeu", icon: Badge },
  { id: "criminal_record", label: "Casier judiciaire", description: "Dossier à l'ambiance sombre", icon: Shield },
  { id: "police_file", label: "Dossier de police", description: "Présentation de dossier d'enquête", icon: Shield },
  { id: "employee_file", label: "Dossier employé", description: "Profil RH d'entreprise", icon: BriefcaseBusiness },
  { id: "business_profile", label: "Profil d'entreprise", description: "Visuel fondateur ou propriétaire", icon: BriefcaseBusiness },
  { id: "character_poster", label: "Affiche de personnage", description: "Visuel promotionnel premium", icon: UserRound },
  { id: "studio_portrait", label: "Portrait studio", description: "Portrait RP soigné", icon: ScanFace },
];

export default function CharacterPageClient({ initialCharacters }: { initialCharacters?: SavedCharacter[] } = {}) {
  const prompt = usePrompt();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [assetType, setAssetType] = useState<CharacterAssetType>("character_poster");
  const [characterName, setCharacterName] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>(initialCharacters ?? []);
  const [selectedMemory, setSelectedMemory] = useState<SavedCharacter | null>(null);
  const [showBetterResultGuide, setShowBetterResultGuide] = useState(false);
  const activeStep = result ? 2 : sourceImage ? 1 : 0;

  useEffect(() => {
    if (initialCharacters) return;
    backendFetch("/characters")
      .then((res) => readApiResponse<{ characters: SavedCharacter[] }>(res))
      .then((data) => setSavedCharacters(data.characters ?? []))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Format non pris en charge. Utilisez PNG, JPG ou WEBP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Votre image est trop lourde. Compressez-la ou utilisez un fichier plus léger.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const preview = reader.result as string;
      const data = preview.split(",")[1];
      setSourceImage({ data, mimeType: file.type, preview });
      setSelectedMemory(null);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!sourceImage && !selectedMemory?.image_preview) {
      setError("Ajoutez votre personnage avant de générer un dossier.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const memoryImage = selectedMemory?.image_preview?.includes(",")
        ? {
            data: selectedMemory.image_preview.split(",")[1] ?? "",
            mimeType: selectedMemory.image_preview.slice(5, selectedMemory.image_preview.indexOf(";")) || "image/webp",
          }
        : null;
      const activeImage = sourceImage
        ? { data: sourceImage.data, mimeType: sourceImage.mimeType }
        : memoryImage;

      const res = await backendFetch("/character-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceImage: activeImage,
          assetType,
          characterName: characterName || selectedMemory?.name,
          role: role || selectedMemory?.role,
          organization,
          city: city || selectedMemory?.server,
          notes: selectedMemory?.description
            ? `Use the uploaded character as the exact identity reference. Preserve the same face, hairstyle, skin tone, tattoos, body proportions, outfit identity and recognizable features. Do not redesign the character. Create the requested scene while keeping this character recognizable.\n\n${selectedMemory.description}\n\n${notes}`
            : notes,
        }),
      });

      const data = await readApiResponse<{ image: string }>(res);

      setResult(data.image);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result;
    link.download = `neva-character-${assetType}.webp`;
    link.click();
  };

  const selectMemory = async (character: SavedCharacter) => {
    const res = await backendFetch(`/characters/${character.id}`);
    const data = await readApiResponse<{ character: SavedCharacter }>(res);
    setSelectedMemory(data.character);
    if (data.character.image_preview) {
      setSourceImage({
        preview: data.character.image_preview,
        data: data.character.image_preview.split(",")[1] ?? "",
        mimeType: data.character.image_preview.slice(5, data.character.image_preview.indexOf(";")) || "image/webp",
      });
    }
    setCharacterName(data.character.name);
    setRole(data.character.role ?? "");
    setCity(data.character.server ?? "");
    setResult(null);
    setError(null);
  };

  const renameMemory = async (character: SavedCharacter) => {
    const name = await prompt({
      title: "Renommer le personnage",
      label: "Nouveau nom",
      defaultValue: character.name,
      placeholder: "Nom du personnage",
    });
    if (!name) return;
    const res = await backendFetch(`/characters/${character.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await readApiResponse<{ character: SavedCharacter }>(res);
    setSavedCharacters((prev) => prev.map((item) => item.id === character.id ? { ...item, name: data.character.name } : item));
    if (selectedMemory?.id === character.id) setSelectedMemory((prev) => prev ? { ...prev, name: data.character.name } : prev);
  };

  const deleteMemory = async (id: string) => {
    await readApiResponse<{ ok: boolean }>(await backendFetch(`/characters/${id}`, { method: "DELETE" }));
    setSavedCharacters((prev) => prev.filter((item) => item.id !== id));
    if (selectedMemory?.id === id) setSelectedMemory(null);
  };

  const improveCharacterPrompt = () => {
    const base = notes.trim() || "Crée une scène RP premium avec ce personnage.";
    setNotes(`Use the uploaded character as the exact identity reference. Preserve the same face, hairstyle, skin tone, tattoos and body proportions. ${base} Create a realistic GTA V FiveM roleplay asset with cinematic natural lighting, readable composition, premium server presentation, and clean detail. Do not change the character identity, outfit identity, tattoos, hairstyle or recognizable features. No distorted face, no unreadable text, no fake official logos.`);
    setShowBetterResultGuide(false);
  };

  const activeAsset = ASSETS.find((asset) => asset.id === assetType);

  return (
    <div className="relative mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
      {/* Halo — la profondeur de la scène */}
      <div
        aria-hidden
        className="pv-halo--violet pv-halo right-[-140px] top-[-140px] h-[440px] w-[600px]"
        style={{ opacity: 0.55 }}
      />

      <div className="relative">
        <ModuleHeader
          icon={ScanFace}
          eyebrow="Neva Character"
          title="Transformez un personnage en dossier RP complet"
          description="Importez votre personnage, choisissez un document, puis générez une identité cohérente."
          accent="violet"
          meta="2 créations / document"
          activeStep={activeStep}
          steps={[
            { label: "Importer", detail: "Personnage source" },
            { label: "Choisir", detail: activeAsset?.label ?? "Document" },
            { label: "Exporter", detail: "Dossier prêt" },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          {/* ── Table d'examen — le dossier ─────────────────────── */}
          <section className="pv-glass pv-edge rounded-2xl min-h-[380px] overflow-hidden xl:min-h-[420px]">
            {!result ? (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center px-5 py-10 text-center xl:min-h-[420px]">
                {sourceImage ? (
                  <div className="relative mb-6 aspect-[4/5] w-full max-w-[480px] overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-abyss">
                    <Image src={sourceImage.preview} alt="Personnage téléversé" fill sizes="620px" className="object-contain" />
                  </div>
                ) : (
                  <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-violet/25 bg-[rgba(164,139,232,0.08)] text-[color:var(--num-color)]">
                    <UserRound size={22} />
                  </span>
                )}
                <p className="pv-display text-lg text-ink/85">Le dossier RP apparaîtra ici.</p>
                <p className="pv-meta mt-3 max-w-sm">
                  Le visage, les tatouages et les accessoires restent la base du rendu.
                </p>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--hairline)] px-5 py-4">
                  <div>
                    <h2 className="pv-label text-[color:var(--num-color)]">Dossier généré</h2>
                    <p className="mt-1 text-[13px] text-steel">{activeAsset?.label}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[40px]"
                      onClick={() => setShowBetterResultGuide((value) => !value)}
                    >
                      Je ne suis pas satisfait
                    </Button>
                    <Button size="sm" className="min-h-[40px]" onClick={download}>
                      <Download size={12} />
                      Télécharger
                    </Button>
                  </div>
                </div>

                {showBetterResultGuide ? (
                  <div className="border-b border-[color:var(--hairline)] px-5 py-5">
                    <p className="pv-display mb-4 text-lg text-ink">Comment obtenir un meilleur résultat</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        "Ajoutez une référence claire du personnage.",
                        "Décrivez le document RP attendu et son contexte.",
                        "Précisez le rôle, l'organisation et le serveur.",
                        "Indiquez ce qui ne doit pas changer : visage, tatouages, coiffure, tenue.",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className="rounded-lg border border-[color:var(--hairline)] bg-abyss p-3 text-xs leading-relaxed text-steel"
                        >
                          <span className="pv-num mr-2">0{index + 1}</span>
                          {item}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4 min-h-[40px]"
                      onClick={improveCharacterPrompt}
                    >
                      Améliorer mon prompt automatiquement
                    </Button>
                  </div>
                ) : null}

                <div className="relative m-5 min-h-[360px] flex-1 overflow-hidden rounded-xl bg-abyss">
                  <Image src={result} alt="Dossier de personnage généré" fill sizes="1000px" className="object-contain" />
                </div>
              </div>
            )}
          </section>

          {/* ── Panneau de composition ──────────────────────────── */}
          <section className="pv-glass pv-edge rounded-2xl self-start overflow-hidden">
            <div className="flex items-baseline justify-between border-b border-[color:var(--hairline)] px-5 py-4">
              <h2 className="pv-label text-[color:var(--num-color)]">Composition</h2>
              <span className="pv-meta">{activeAsset?.label}</span>
            </div>

            {/* 01 — Personnage */}
            <div className="border-b border-[color:var(--hairline)] p-5">
              <p className="pv-label mb-3">
                <span className="pv-num mr-2">01</span>
                Personnage
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-[rgba(246,243,238,0.22)] bg-abyss transition-colors duration-300 hover:border-[rgba(164,139,232,0.45)]"
              >
                {sourceImage ? (
                  <Image src={sourceImage.preview} alt="Personnage téléversé" fill sizes="430px" className="object-contain" />
                ) : (
                  <span className="flex flex-col items-center gap-2 px-6 text-center">
                    <Upload size={20} className="text-dusk transition-colors duration-300 group-hover:text-[color:var(--num-color)]" />
                    <span className="text-sm font-medium text-ink/80">Téléverser le personnage</span>
                    <span className="text-xs leading-relaxed text-steel">
                      Visage, tatouages et accessoires restent la base.
                    </span>
                  </span>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />

              {savedCharacters.length > 0 ? (
                <div className="mt-5">
                  <p className="pv-label mb-2">Personnages mémorisés</p>
                  <ul>
                    {savedCharacters.map((character) => {
                      const isSelected = selectedMemory?.id === character.id;
                      return (
                        <li
                          key={character.id}
                          className={`pv-row flex items-center gap-3 px-1 py-2.5 ${
                            isSelected ? "bg-[rgba(164,139,232,0.06)]" : ""
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => selectMemory(character)}
                            className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            {character.image_preview ? (
                              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[color:var(--hairline)]">
                                <Image src={character.image_preview} alt={character.name} fill sizes="44px" className="object-cover" />
                              </span>
                            ) : (
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--hairline)] bg-abyss">
                                <UserRound size={14} className="text-[color:var(--num-color)]/70" />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span
                                className={`block truncate text-[13px] font-medium ${
                                  isSelected ? "text-[color:var(--num-color)]" : "text-ink"
                                }`}
                              >
                                {character.name}
                              </span>
                              <span className="block truncate text-xs text-steel">
                                {character.role ?? character.style ?? "Référence identité"}
                              </span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => renameMemory(character)}
                            className="min-h-[40px] shrink-0 px-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-steel transition-colors duration-300 hover:text-ink"
                          >
                            Renommer
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMemory(character.id)}
                            className="min-h-[40px] shrink-0 px-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-err/80 transition-colors duration-300 hover:text-err"
                          >
                            Supprimer
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* 02 — Document */}
            <div className="border-b border-[color:var(--hairline)] p-5">
              <p className="pv-label mb-3">
                <span className="pv-num mr-2">02</span>
                Document
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {ASSETS.map((asset) => {
                  const isActive = assetType === asset.id;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setAssetType(asset.id)}
                      aria-pressed={isActive}
                      className={`flex min-h-[64px] items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors duration-300 ${
                        isActive
                          ? "border-[color:var(--color-ink)] bg-[rgba(164,139,232,0.12)]"
                          : "border-[color:var(--hairline)] hover:border-[#4A4A4A]"
                      }`}
                    >
                      <asset.icon
                        size={14}
                        className={`mt-0.5 shrink-0 ${isActive ? "text-[color:var(--num-color)]" : "text-dusk"}`}
                      />
                      <span className="min-w-0">
                        <span
                          className={`block text-[13px] font-medium ${
                            isActive ? "text-[color:var(--num-color)]" : "text-ink/80"
                          }`}
                        >
                          {asset.label}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-snug text-steel">
                          {asset.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 03 — Identité */}
            <div className="p-5">
              <p className="pv-label mb-3">
                <span className="pv-num mr-2">03</span>
                Identité
              </p>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="character-name">Nom RP</Label>
                  <Input
                    id="character-name"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Jason Carter"
                  />
                </div>
                <div>
                  <Label htmlFor="character-role">Métier / rôle</Label>
                  <Input
                    id="character-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Officier LSPD, mécano, CEO..."
                  />
                </div>
                <div>
                  <Label htmlFor="character-organization">Organisation</Label>
                  <Input
                    id="character-organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="LSPD, Benny's, cartel, business..."
                  />
                </div>
                <div>
                  <Label htmlFor="character-city">Ville / serveur</Label>
                  <Input
                    id="character-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Los Santos, Neva RP..."
                  />
                </div>
                <div>
                  <Label htmlFor="character-notes">Notes</Label>
                  <Textarea
                    id="character-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Ambiance, couleurs, histoire, faction..."
                  />
                </div>
              </div>

              {error ? (
                <FormMessage tone="error" className="mt-4">
                  {error}
                </FormMessage>
              ) : null}

              <Button
                onClick={generate}
                disabled={loading || (!sourceImage && !selectedMemory)}
                variant="gradient"
                size="lg"
                className="mt-5 w-full"
              >
                {loading ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Génération en cours…
                  </>
                ) : (
                  "Générer le dossier"
                )}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
