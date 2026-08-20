"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { DesignPageClient } from "@/app/dashboard/design/DesignPageClient";
import { EnhancePageClient } from "@/app/dashboard/enhance/EnhancePageClient";
import CharacterPageClient from "@/app/dashboard/character/CharacterPageClient";
import AuditPageClient from "@/app/dashboard/audit/AuditPageClient";
import DownloadsClient from "@/app/dashboard/downloads/DownloadsClient";
import BillingPage from "@/app/dashboard/billing/page";
import SettingsClient from "@/app/dashboard/settings/SettingsClient";
import ChatPage from "@/app/dashboard/chat/page";
import BrandPage from "@/app/dashboard/brand/page";
import CodePage from "@/app/dashboard/code/page";
import LandingModulePage from "@/app/dashboard/landing/page";
import PromptPage from "@/app/dashboard/prompt/page";
import LogoWizard from "@/app/dashboard/projects/[id]/create/logo/LogoWizard";
import { AdminsClient } from "@/app/admin/admins/AdminsClient";
import { AdminAnnouncementsClient } from "@/app/admin/announcements/AdminAnnouncementsClient";
import { AdminNewsletterClient } from "@/app/admin/newsletter/AdminNewsletterClient";
import { AdminNevaDesignClient } from "@/app/admin/neva-design/AdminNevaDesignClient";
import { AdminMaintenanceClient } from "@/app/admin/maintenance/AdminMaintenanceClient";
import { AdminUsersClient } from "@/app/admin/users/AdminUsersClient";
import { SecurityAlertsClient } from "@/app/admin/security-alerts/SecurityAlertsClient";
import { DEFAULT_NEVA_DESIGN_PORTFOLIO } from "@/lib/neva-design-portfolio";
import type { SiteAnnouncement } from "@/lib/announcements";
import type { SignupSecurityEvent } from "@/lib/signup-security";

const mockUser = {
  id: "preview-user",
  name: "Léa Moreau",
  email: "lea@nevadesign.fr",
  avatarUrl: null,
  initials: "LM",
  credits: 8,
  maxCredits: 12,
  plan: "creator",
  creditReviewStatus: null,
};

const mockAnnouncements: SiteAnnouncement[] = [
  {
    id: "a1",
    title: "Le mode 4K arrive sur Neva Studio",
    message: "Les exports 4096px sont disponibles pour les plans Studio et Agence.",
    kind: "new",
    badge: null,
    cta_label: "Découvrir",
    href: "/dashboard/design",
    accent: "yellow",
    is_active: true,
    priority: 10,
    starts_at: null,
    ends_at: null,
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-01T10:00:00Z",
  },
  {
    id: "a2",
    title: "NUIT20 — 20 % sur le plan Creator",
    message: "Offre de lancement valable jusqu'à la fin du mois.",
    kind: "promo",
    badge: null,
    cta_label: null,
    href: null,
    accent: "green",
    is_active: true,
    priority: 5,
    starts_at: null,
    ends_at: "2026-08-31T23:59:00Z",
    created_at: "2026-08-02T10:00:00Z",
    updated_at: "2026-08-02T10:00:00Z",
  },
];

const mockAlerts: SignupSecurityEvent[] = [
  {
    id: "s1",
    user_id: "u-201",
    email: "nouveau@exemple.com",
    ip_address: "82.64.112.9",
    matching_user_ids: ["u-115"],
    risk_score: 65,
    reason: "Adresse déjà associée à un autre compte récent.",
    status: "pending_review",
    created_at: "2026-08-11T22:10:00Z",
  },
  {
    id: "s2",
    user_id: "u-202",
    email: "farm@exemple.com",
    ip_address: "82.64.112.9",
    matching_user_ids: ["u-88", "u-90"],
    risk_score: 92,
    reason: "Bonus d'inscription déjà consommé depuis cette adresse.",
    status: "blocked",
    created_at: "2026-08-11T21:40:00Z",
  },
  {
    id: "s3",
    user_id: "u-203",
    email: "clean@exemple.com",
    ip_address: "90.12.45.201",
    matching_user_ids: [],
    risk_score: 0,
    reason: "Aucun compte précédent détecté.",
    status: "allowed",
    created_at: "2026-08-11T20:05:00Z",
  },
];

const mockAdmins = [
  {
    id: "env:admin@nevadesign.fr",
    email: "admin@nevadesign.fr",
    is_active: true,
    source: "env" as const,
    created_at: null,
    created_by: null,
  },
  {
    id: "db-1",
    email: "lea@nevadesign.fr",
    is_active: true,
    source: "database" as const,
    created_at: "2026-07-20T09:00:00Z",
    created_by: "admin@nevadesign.fr",
  },
];

const mockPacks = [
  {
    id: "neva-pack",
    name: "Neva Pack",
    tagline: "Pack GFX complet",
    downloadUrl: "#",
    purchasedAt: "2026-08-02T10:00:00Z",
  },
];

// ── Placeholders CSS/SVG de l'étape B (run 5.4) — captures SANS génération ──
// Des SVG dessinés à la main (lettre + dégradés), jamais une image générée.
function svgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const previewLogoSvg = (fill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#118AB2"/><stop offset="1" stop-color="#06D6A0"/></linearGradient></defs><text x="50%" y="58%" text-anchor="middle" font-family="Arial Black, Arial" font-size="300" font-weight="900" fill="${fill}">AB</text></svg>`;

const previewFondSvg = (a: string, b: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><defs><linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="512" height="512" fill="url(%23f)"/><g stroke="white" stroke-width="3" fill="none" opacity="0.3"><circle cx="60" cy="80" r="10"/><circle cx="440" cy="120" r="8"/><path d="M80 420 q 14 -18 28 0"/><path d="M400 400 q 14 -18 28 0"/><circle cx="250" cy="60" r="6"/></g><text x="50%" y="58%" text-anchor="middle" font-family="Arial Black, Arial" font-size="220" font-weight="900" fill="white">AB</text></svg>`;

const DEV_ETAPE_B_MASTER = {
  url: svgDataUri(previewLogoSvg("url(%23g)")),
  whiteUrl: svgDataUri(previewLogoSvg("#FFFFFF")),
  blackUrl: svgDataUri(previewLogoSvg("#111111")),
};

const DEV_ETAPE_B_FONDS = [
  { fondUrl: "dev-fond-1", previewUrl: svgDataUri(previewFondSvg("#118AB2", "#06D6A0")), choix: "signature" as const },
  { fondUrl: "dev-fond-2", previewUrl: svgDataUri(previewFondSvg("#0B3C5D", "#1D2440")), choix: "signature" as const },
];

export default function DevPreviewClient({ screen }: { screen: string }) {
  switch (screen) {
    // Run 5.4 : les écrans de l'étape B du wizard logo, sans aucune génération
    case "wizard-logo-etape-b":
      return (
        <WizardScene>
          <LogoWizard projectId="preview" projectName="Azure Bay" devInitial={{ master: DEV_ETAPE_B_MASTER, etapeB: "choix" }} />
        </WizardScene>
      );
    case "wizard-logo-etape-b-fonds":
      return (
        <WizardScene>
          <LogoWizard
            projectId="preview"
            projectName="Azure Bay"
            devInitial={{ master: DEV_ETAPE_B_MASTER, etapeB: "fonds", fonds: DEV_ETAPE_B_FONDS }}
          />
        </WizardScene>
      );
    case "design":
      return (
        <DashboardShell user={mockUser}>
          <DesignPageClient userPlan="creator" />
        </DashboardShell>
      );
    case "chat":
      return (
        <DashboardShell user={mockUser}>
          <ChatPage />
        </DashboardShell>
      );
    case "enhance":
      return (
        <DashboardShell user={mockUser}>
          <EnhancePageClient userPlan="creator" />
        </DashboardShell>
      );
    case "character":
      return (
        <DashboardShell user={mockUser}>
          <CharacterPageClient />
        </DashboardShell>
      );
    case "audit":
      return (
        <DashboardShell user={mockUser}>
          <AuditPageClient />
        </DashboardShell>
      );
    case "downloads":
      return (
        <DashboardShell user={mockUser}>
          <DownloadsClient ownedPacks={mockPacks} successPack={null} />
        </DashboardShell>
      );
    case "billing":
      return (
        <DashboardShell user={mockUser}>
          <BillingPage />
        </DashboardShell>
      );
    case "brand":
      return (
        <DashboardShell user={mockUser}>
          <BrandPage />
        </DashboardShell>
      );
    case "code":
      return (
        <DashboardShell user={mockUser}>
          <CodePage />
        </DashboardShell>
      );
    case "landing-module":
      return (
        <DashboardShell user={mockUser}>
          <LandingModulePage />
        </DashboardShell>
      );
    case "prompt":
      return (
        <DashboardShell user={mockUser}>
          <PromptPage />
        </DashboardShell>
      );
    case "settings":
      return (
        <DashboardShell user={mockUser}>
          <SettingsClient
            email="lea@nevadesign.fr"
            initialDisplayName="Léa Moreau"
            initialAvatarUrl={null}
            initialDiscord={{ username: "lea.moreau", avatarUrl: null }}
            initialBio="Directrice artistique du serveur Horizon RP."
            initialNotificationPrefs={{ sound: true, browser: false }}
            initialMfaEnabled={false}
          />
        </DashboardShell>
      );
    case "admin-users":
      return <AdminScene><AdminUsersClient /></AdminScene>;
    case "admin-admins":
      return <AdminScene><AdminsClient initialAdmins={mockAdmins} /></AdminScene>;
    case "admin-announcements":
      return (
        <AdminScene>
          <AdminAnnouncementsClient initialAnnouncements={mockAnnouncements} />
        </AdminScene>
      );
    case "admin-newsletter":
      return (
        <AdminScene>
          <AdminNewsletterClient
            initialStats={{
              total: 2431,
              free: 2210,
              paid: 221,
              resendConfigured: true,
              fromEmail: "studio@nevadesign.fr",
            }}
            adminEmail="admin@nevadesign.fr"
          />
        </AdminScene>
      );
    case "admin-portfolio":
      return (
        <AdminScene>
          <AdminNevaDesignClient
            initialItems={DEFAULT_NEVA_DESIGN_PORTFOLIO.slice(0, 8)}
            tableMissing={false}
          />
        </AdminScene>
      );
    case "admin-maintenance":
      return (
        <AdminScene>
          <AdminMaintenanceClient
            initialMaintenance={{
              id: "global",
              enabled: false,
              title: "Maintenance en cours",
              message: "Neva Design revient dans quelques minutes. Merci pour votre patience.",
              allow_admin_access: true,
              starts_at: null,
              ends_at: null,
              updated_by: "admin@nevadesign.fr",
              updated_at: "2026-08-10T22:00:00Z",
            }}
            tableMissing={false}
          />
        </AdminScene>
      );
    case "admin-security":
      return <AdminScene><SecurityAlertsClient initialAlerts={mockAlerts} /></AdminScene>;
    default:
      return (
        <div className="p-10 font-mono text-sm text-steel">
          Écran inconnu : {screen}
        </div>
      );
  }
}

/* L'atelier wizard en aperçu — fond clair calme, comme le layout dashboard. */
function WizardScene({ children }: { children: React.ReactNode }) {
  return (
    <div className="pv-light pv-atelier relative flex min-h-screen flex-col bg-paper text-ink">
      <style>{`html{color-scheme:dark}`}</style>
      <div aria-hidden className="pv-scene-bg--dawn-calm pointer-events-none fixed inset-0" />
      <div className="relative flex flex-1 flex-col">{children}</div>
    </div>
  );
}

/* La régie en aperçu — la même aube diluée que le châssis admin,
   fixe, et rien d'autre : l'endroit le plus neutre du site. */
function AdminScene({ children }: { children: React.ReactNode }) {
  return (
    <div className="pv-light pv-atelier relative min-h-screen bg-paper text-ink">
      <style>{`html{color-scheme:dark}`}</style>
      <div aria-hidden className="pv-scene-bg--dawn-calm pointer-events-none fixed inset-0" />
      <div className="relative px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </div>
    </div>
  );
}
