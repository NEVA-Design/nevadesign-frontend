"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Badge, BriefcaseBusiness, Download, FileBadge, IdCard, ImageIcon, Loader2, ScanFace, Shield, Upload, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";
import { readApiResponse } from "@/lib/api/client";

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

const ASSETS: AssetOption[] = [
  { id: "rp_identity_card", label: "RP Identity Card", description: "Civil RP profile card", icon: IdCard },
  { id: "passport", label: "Passport", description: "Fictional RP travel prop", icon: FileBadge },
  { id: "driver_license", label: "Driver License", description: "In-universe driving card", icon: Badge },
  { id: "criminal_record", label: "Criminal Record", description: "Dark dossier asset", icon: Shield },
  { id: "police_file", label: "Police File", description: "Case file presentation", icon: Shield },
  { id: "employee_file", label: "Employee File", description: "Company HR profile", icon: BriefcaseBusiness },
  { id: "business_profile", label: "Business Profile", description: "Founder or owner asset", icon: BriefcaseBusiness },
  { id: "character_poster", label: "Character Poster", description: "Premium promo artwork", icon: UserRound },
  { id: "studio_portrait", label: "Studio Portrait", description: "Polished RP portrait", icon: ScanFace },
];

export default function CharacterPageClient() {
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
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<SavedCharacter | null>(null);
  const [showBetterResultGuide, setShowBetterResultGuide] = useState(false);
  const activeStep = result ? 2 : sourceImage ? 1 : 0;

  useEffect(() => {
    fetch("/api/characters")
      .then((res) => readApiResponse<{ characters: SavedCharacter[] }>(res))
      .then((data) => setSavedCharacters(data.characters ?? []))
      .catch(() => {});
  }, []);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Format non supporté. Utilise PNG, JPG ou WEBP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Ton image est trop lourde. Compresse-la ou utilise une image plus légère.");
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
      setError("Ajoute ton personnage avant de générer un dossier.");
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

      const res = await fetch("/api/character-assets", {
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
    const res = await fetch(`/api/characters/${character.id}`);
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
    const name = window.prompt("Nouveau nom du personnage", character.name)?.trim();
    if (!name) return;
    const res = await fetch(`/api/characters/${character.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await readApiResponse<{ character: SavedCharacter }>(res);
    setSavedCharacters((prev) => prev.map((item) => item.id === character.id ? { ...item, name: data.character.name } : item));
    if (selectedMemory?.id === character.id) setSelectedMemory((prev) => prev ? { ...prev, name: data.character.name } : prev);
  };

  const deleteMemory = async (id: string) => {
    await readApiResponse<{ ok: boolean }>(await fetch(`/api/characters/${id}`, { method: "DELETE" }));
    setSavedCharacters((prev) => prev.filter((item) => item.id !== id));
    if (selectedMemory?.id === id) setSelectedMemory(null);
  };

  const improveCharacterPrompt = () => {
    const base = notes.trim() || "Crée une scène RP premium avec ce personnage.";
    setNotes(`Use the uploaded character as the exact identity reference. Preserve the same face, hairstyle, skin tone, tattoos and body proportions. ${base} Create a realistic GTA V FiveM roleplay asset with cinematic natural lighting, readable composition, premium server presentation, and clean detail. Do not change the character identity, outfit identity, tattoos, hairstyle or recognizable features. No distorted face, no unreadable text, no fake official logos.`);
    setShowBetterResultGuide(false);
  };

  return (
    <div className="mx-auto min-h-full max-w-[1320px] p-4 sm:p-6 lg:p-8">
      <ModuleHeader
        icon={ScanFace}
        eyebrow="Neva Character"
        title="Transformez un personnage en dossier RP complet"
        description="Importez votre personnage, choisissez un document, puis générez une identité cohérente."
        accent="#FF6B7D"
        meta="2 créations / document"
        activeStep={activeStep}
        steps={[
          { label: "Importer", detail: "Personnage source" },
          { label: "Choisir", detail: ASSETS.find((asset) => asset.id === assetType)?.label ?? "Document" },
          { label: "Exporter", detail: "Dossier prêt" },
        ]}
      />
      <div className="hidden">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-[#FF6B7D]/25 bg-[#FF6B7D]/10 px-2.5 py-1 text-xs font-semibold text-[#FFB5C8]">
            <ScanFace size={13} />
            NEVA CHARACTER
          </div>
          <h1 className="text-2xl font-bold text-[#F5F0E8]">Create FiveM RP identity assets</h1>
          <p className="mt-1 max-w-2xl text-sm text-[#777]">
            Upload a character and generate clean premium RP files, posters, cards, dossiers and portraits while preserving identity.
          </p>
        </div>
        <div className="text-xs text-[#666]">2 créations / asset</div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_430px]">
        <section className="order-2 rounded-[16px] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)] xl:order-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/[0.12] bg-white/[0.025] transition-colors hover:border-[#FF6B7D]/45"
          >
            {sourceImage ? (
              <Image src={sourceImage.preview} alt="Uploaded character" fill sizes="430px" className="object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload size={24} className="text-[#FF6B7D]" />
                <div className="text-sm font-medium text-[#CCCCC0]">Ajouter le personnage</div>
                <div className="text-xs text-[#666]">Visage, tatouages et accessoires restent la base.</div>
              </div>
            )}
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />

          {savedCharacters.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#555]">Personnages mémorisés</div>
              <div className="grid gap-2">
                {savedCharacters.map((character) => (
                  <div
                    key={character.id}
                    className={`flex items-center gap-3 rounded-[16px] border p-2 transition-colors ${
                      selectedMemory?.id === character.id
                        ? "border-[#A78BFA]/45 bg-[#A78BFA]/10"
                        : "border-white/[0.07] bg-white/[0.025]"
                    }`}
                  >
                    <button type="button" onClick={() => selectMemory(character)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      {character.image_preview ? (
                        <span className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-white/[0.08]">
                          <Image src={character.image_preview} alt={character.name} fill sizes="44px" className="object-cover" />
                        </span>
                      ) : (
                        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                          <UserRound size={15} className="text-[#A78BFA]" />
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-[#F5F0E8]">{character.name}</span>
                        <span className="block truncate text-xs text-[#666]">{character.role ?? character.style ?? "Référence identité"}</span>
                      </span>
                    </button>
                    <button type="button" onClick={() => renameMemory(character)} className="text-[10px] text-[#777] hover:text-[#F5F0E8]">Renommer</button>
                    <button type="button" onClick={() => deleteMemory(character.id)} className="text-[10px] text-[#FF6B7D] hover:text-[#FFB5C8]">Supprimer</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#555]">Templates visuels</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {ASSETS.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setAssetType(asset.id)}
                  className={`flex min-h-[86px] items-start gap-2 rounded-[16px] border px-3 py-3 text-left transition-colors ${
                    assetType === asset.id
                      ? "border-[#FF6B7D]/50 bg-[#FF6B7D]/10 text-[#F5F0E8]"
                      : "border-white/[0.07] bg-white/[0.025] text-[#777] hover:text-[#CCCCC0]"
                  }`}
                >
                  <asset.icon size={15} className="mt-0.5 flex-shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{asset.label}</span>
                    <span className="block text-xs text-[#666]">{asset.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <Field label="Nom RP" value={characterName} onChange={setCharacterName} placeholder="Jason Carter" />
            <Field label="Métier / rôle" value={role} onChange={setRole} placeholder="Officier LSPD, mécano, CEO..." />
            <Field label="Organization" value={organization} onChange={setOrganization} placeholder="LSPD, Benny's, cartel, business..." />
            <Field label="Ville / serveur" value={city} onChange={setCity} placeholder="Los Santos, Neva RP..." />
            <label>
              <span className="mb-1.5 block text-xs font-medium text-[#777]">Extra notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ambiance, couleurs, histoire, faction..."
                className="min-h-20 w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-sm text-[#F5F0E8] outline-none transition-colors placeholder:text-[#444] focus:border-[#FF6B7D]/45"
              />
            </label>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-[#FF6B7D]/25 bg-[#FF6B7D]/10 px-3 py-2 text-sm text-[#FFB5C8]">
              {error}
            </div>
          )}

          <Button onClick={generate} disabled={loading || (!sourceImage && !selectedMemory)} variant="gradient" className="mt-5 w-full">
            {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <ScanFace size={16} className="mr-2" />}
            Générer le dossier
          </Button>
        </section>

        <section className="order-1 min-h-[640px] rounded-[16px] border border-white/[0.08] bg-[#080808] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-5 xl:order-1">
          {!result ? (
            <div className="flex h-full min-h-[600px] flex-col items-center justify-center text-center">
              {sourceImage ? (
                <div className="relative mb-5 aspect-[4/5] w-full max-w-[520px] overflow-hidden rounded-[16px] border border-white/[0.08] bg-black">
                  <Image src={sourceImage.preview} alt="Uploaded character" fill sizes="620px" className="object-contain" />
                </div>
              ) : (
                <>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
                <ImageIcon size={24} className="text-[#555]" />
              </div>
                </>
              )}
              <div className="text-sm font-medium text-[#9A9A9A]">Le dossier RP apparaîtra ici</div>
              <div className="mt-1 max-w-sm text-xs leading-relaxed text-[#555]">
                Le visage, les tatouages et les accessoires restent la base du rendu.
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#F5F0E8]">Dossier généré</div>
                  <div className="text-xs text-[#666]">{ASSETS.find((asset) => asset.id === assetType)?.label}</div>
                </div>
                <button
                  type="button"
                  onClick={download}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.09] px-3 py-1.5 text-xs text-[#CCCCC0] hover:text-[#F5F0E8]"
                >
                  <Download size={13} />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setShowBetterResultGuide((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.09] px-3 py-1.5 text-xs text-[#CCCCC0] hover:text-[#F5F0E8]"
                >
                  Je ne suis pas satisfait
                </button>
              </div>
              {showBetterResultGuide && (
                <div className="mb-4 rounded-[16px] border border-white/[0.07] bg-white/[0.025] p-4">
                  <div className="mb-2 text-sm font-semibold text-[#F5F0E8]">Comment obtenir un meilleur résultat</div>
                  <div className="grid gap-2 text-xs leading-relaxed text-[#777] sm:grid-cols-2">
                    {[
                      "Ajoute une référence claire du personnage.",
                      "Décris le document RP attendu et son contexte.",
                      "Précise le rôle, l’organisation et le serveur.",
                      "Indique ce qu’il ne faut pas changer : visage, tatouages, coiffure, tenue.",
                    ].map((item, index) => (
                      <div key={item} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                        <span className="mr-2 text-[#FF6B7D]">{index + 1}.</span>{item}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={improveCharacterPrompt}
                    className="mt-3 rounded-lg border border-[#FF6B7D]/25 bg-[#FF6B7D]/10 px-3 py-2 text-xs font-medium text-[#FFB5C8] transition-all hover:bg-[#FF6B7D]/20"
                  >
                    Améliorer mon prompt automatiquement
                  </button>
                </div>
              )}
              <div className="relative min-h-[540px] flex-1 overflow-hidden rounded-lg bg-black">
                <Image src={result} alt="Generated character asset" fill sizes="1000px" className="object-contain" />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-medium text-[#777]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-sm text-[#F5F0E8] outline-none transition-colors placeholder:text-[#444] focus:border-[#FF6B7D]/45"
      />
    </label>
  );
}
