export type AnnouncementKind = "promo" | "new" | "update" | "info";
export type AnnouncementAccent = "coral" | "orange" | "yellow" | "green";

export interface SiteAnnouncement {
  id: string;
  title: string;
  message: string;
  kind: AnnouncementKind;
  badge: string | null;
  cta_label: string | null;
  href: string | null;
  accent: AnnouncementAccent;
  is_active: boolean;
  priority: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export const ANNOUNCEMENT_KINDS: AnnouncementKind[] = ["promo", "new", "update", "info"];
export const ANNOUNCEMENT_ACCENTS: AnnouncementAccent[] = ["coral", "orange", "yellow", "green"];

export const KIND_LABELS: Record<AnnouncementKind, string> = {
  promo: "Code promo",
  new: "Nouveau",
  update: "MAJ",
  info: "Info",
};

export const ACCENT_STYLES: Record<AnnouncementAccent, { color: string; bg: string; border: string }> = {
  coral: { color: "#FF6B7D", bg: "#FF6B7D14", border: "#FF6B7D33" },
  orange: { color: "#FF7B4B", bg: "#FF7B4B14", border: "#FF7B4B33" },
  yellow: { color: "#FFD166", bg: "#FFD16612", border: "#FFD16633" },
  green: { color: "#4ADE80", bg: "#4ADE8012", border: "#4ADE8033" },
};

export function isAnnouncementKind(value: unknown): value is AnnouncementKind {
  return typeof value === "string" && ANNOUNCEMENT_KINDS.includes(value as AnnouncementKind);
}

export function isAnnouncementAccent(value: unknown): value is AnnouncementAccent {
  return typeof value === "string" && ANNOUNCEMENT_ACCENTS.includes(value as AnnouncementAccent);
}
