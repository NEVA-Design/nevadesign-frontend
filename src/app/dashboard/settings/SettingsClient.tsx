"use client"
import { useState, useRef } from "react"
import { Loader2, Upload } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FormMessage, Input, Label, Textarea } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { readApiResponse } from "@/lib/api/client"

/*
 * Paramètres — navigation d'onglets en filets, panneaux éditoriaux.
 * Toute la mécanique (profil, avatar, notifications avec miroir
 * localStorage, mot de passe Supabase) est conservée à l'identique.
 */

const tabs = [
  { id: "profile", label: "Profil" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Sécurité" },
  { id: "appearance", label: "Apparence" },
]

interface Props {
  email: string
  initialDisplayName: string
  initialAvatarUrl: string | null
  initialDiscordHandle: string
  initialBio: string
  initialNotificationPrefs: Record<string, unknown>
}

type Status = { type: 'success' | 'error'; message: string } | null

function StatusMessage({ status }: { status: Status }) {
  if (!status) return null
  return (
    <FormMessage tone={status.type === 'success' ? 'success' : 'error'} className="mt-6">
      {status.message}
    </FormMessage>
  )
}

export default function SettingsClient({
  email,
  initialDisplayName,
  initialAvatarUrl,
  initialDiscordHandle,
  initialBio,
  initialNotificationPrefs,
}: Props) {
  const [activeTab, setActiveTab] = useState("profile")

  // Profile state
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [discordHandle, setDiscordHandle] = useState(initialDiscordHandle)
  const [bio, setBio] = useState(initialBio)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileStatus, setProfileStatus] = useState<Status>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Notification state
  const [notifSound, setNotifSound] = useState(Boolean(initialNotificationPrefs.sound))
  const [notifBrowser, setNotifBrowser] = useState(Boolean(initialNotificationPrefs.browser))
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifStatus, setNotifStatus] = useState<Status>(null)

  // Security state
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [secSaving, setSecSaving] = useState(false)
  const [secStatus, setSecStatus] = useState<Status>(null)

  const initials = (displayName || email).charAt(0).toUpperCase()

  // ── Profil ────────────────────────────────────────────────────────────────────

  const saveProfile = async () => {
    setProfileSaving(true)
    setProfileStatus(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName, discord_handle: discordHandle, bio }),
      })
      await readApiResponse<{ ok: boolean }>(res)
      setProfileStatus({ type: 'success', message: 'Profil enregistré.' })
    } catch (e: unknown) {
      setProfileStatus({ type: 'error', message: (e as Error).message ?? 'Erreur' })
    } finally {
      setProfileSaving(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    setAvatarUploading(true)
    setProfileStatus(null)
    try {
      const form = new FormData()
      form.append('avatar', file)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: form })
      const data = await readApiResponse<{ url: string }>(res)
      setAvatarUrl(data.url)
      setProfileStatus({ type: 'success', message: 'Photo de profil mise à jour.' })
    } catch (e: unknown) {
      setProfileStatus({ type: 'error', message: (e as Error).message ?? 'Erreur de téléversement' })
    } finally {
      setAvatarUploading(false)
    }
  }

  // ── Notifications ─────────────────────────────────────────────────────────────

  const handleBrowserNotifToggle = async (enabled: boolean) => {
    if (enabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setNotifStatus({ type: 'error', message: 'Permission refusée par le navigateur.' })
          return
        }
      }
      if (Notification.permission === 'denied') {
        setNotifStatus({
          type: 'error',
          message: 'Notifications bloquées — autorisez-les dans les paramètres de votre navigateur.',
        })
        return
      }
    }
    setNotifBrowser(enabled)
    setNotifStatus(null)
  }

  const saveNotifications = async () => {
    setNotifSaving(true)
    setNotifStatus(null)
    try {
      const prefs = { sound: notifSound, browser: notifBrowser }
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_prefs: prefs }),
      })
      await readApiResponse<{ ok: boolean }>(res)
      // Miroir localStorage : DesignPageClient lit ces clés instantanément
      localStorage.setItem('neva_notif_sound', notifSound ? 'true' : 'false')
      localStorage.setItem('neva_notif_browser', notifBrowser ? 'true' : 'false')
      setNotifStatus({ type: 'success', message: 'Préférences enregistrées.' })
    } catch (e: unknown) {
      setNotifStatus({ type: 'error', message: (e as Error).message ?? 'Erreur' })
    } finally {
      setNotifSaving(false)
    }
  }

  // ── Sécurité ──────────────────────────────────────────────────────────────────

  const changePassword = async () => {
    if (!newPassword) return
    if (newPassword.length < 6) {
      setSecStatus({ type: 'error', message: 'Mot de passe trop court — 6 caractères minimum.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setSecStatus({ type: 'error', message: 'Les mots de passe ne correspondent pas.' })
      return
    }
    setSecSaving(true)
    setSecStatus(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw new Error(error.message)
      setNewPassword('')
      setConfirmPassword('')
      setSecStatus({ type: 'success', message: 'Mot de passe mis à jour.' })
    } catch (e: unknown) {
      setSecStatus({ type: 'error', message: (e as Error).message ?? 'Erreur' })
    } finally {
      setSecSaving(false)
    }
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────────

  return (
    <div className="relative mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div
        aria-hidden
        className="pv-halo--violet pv-halo right-[-10%] top-[-8%] h-[440px] w-[500px]"
        style={{ opacity: 0.5 }}
      />

      <div className="relative w-full max-w-3xl">
        {/* ── En-tête ───────────────────────────────────────────── */}
        <p className="pv-label text-[color:var(--num-color)]">Compte</p>
        <h1 className="pv-display mt-4 text-[clamp(2rem,4vw,2.8rem)] text-ink">Paramètres</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel">
          Gérez votre profil, vos préférences et la sécurité de votre compte.
        </p>

        {/* ── Navigation d'onglets en filets ────────────────────── */}
        <div
          role="tablist"
          aria-label="Sections des paramètres"
          className="mt-9 flex gap-1 overflow-x-auto border-b border-[color:var(--hairline)]"
        >
          {tabs.map((tab, index) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px flex min-h-[44px] items-baseline gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-[13px] transition-colors duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                  active
                    ? "border-violet font-medium text-ink"
                    : "border-transparent text-steel hover:text-ink/80"
                }`}
              >
                <span
                  className={`font-mono text-[10px] tracking-[0.12em] ${
                    active ? "text-[color:var(--num-color)]" : "text-ink/25"
                  }`}
                >
                  0{index + 1}
                </span>
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── PROFIL ────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="pt-9">
            {/* Photo de profil */}
            <section className="border-b border-[color:var(--hairline)] pb-9">
              <h2 className="pv-label mb-6">Photo de profil</h2>
              <div className="flex items-center gap-5">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[color:var(--hairline-strong)] bg-white">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="Photo de profil" fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[rgba(124,106,255,0.08)]">
                      <span className="pv-display text-2xl text-[color:var(--num-color)]">{initials}</span>
                    </div>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/60">
                      <Loader2 size={16} className="animate-spin text-[color:var(--num-color)]" />
                    </div>
                  )}
                </div>
                <div>
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    <Upload size={13} />
                    {avatarUploading ? 'Téléversement…' : 'Téléverser une photo'}
                  </Button>
                  <p className="mt-2 font-mono text-[10px] tracking-[0.08em] text-dusk">
                    JPG, PNG ou WebP — 4 Mo max
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadAvatar(file)
                      e.target.value = ''
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Informations */}
            <section className="pt-9">
              <h2 className="pv-label mb-6">Informations</h2>
              <div className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="display-name">Nom d&apos;affichage</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Votre nom"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="settings-email">Adresse e-mail</Label>
                    <Input
                      id="settings-email"
                      value={email}
                      readOnly
                      className="cursor-default select-all text-steel"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="discord-handle">Discord</Label>
                  <Input
                    id="discord-handle"
                    value={discordHandle}
                    onChange={(e) => setDiscordHandle(e.target.value)}
                    placeholder="@pseudo ou pseudo#0001"
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="settings-bio">Bio</Label>
                  <Textarea
                    id="settings-bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Parlez-nous de vos projets FiveM…"
                    maxLength={500}
                  />
                  <p className="mt-1.5 text-right font-mono text-[10px] tracking-[0.08em] text-dusk">
                    {bio.length}/500
                  </p>
                </div>
              </div>

              <StatusMessage status={profileStatus} />
              <div className="mt-6 flex justify-end">
                <Button onClick={saveProfile} disabled={profileSaving}>
                  {profileSaving ? (
                    <><Loader2 size={13} className="animate-spin" />Enregistrement…</>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
              </div>
            </section>
          </div>
        )}

        {/* ── NOTIFICATIONS ─────────────────────────────────────── */}
        {activeTab === "notifications" && (
          <div className="pt-9">
            <h2 className="pv-display text-lg text-ink">Alertes de création</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-steel">
              Recevez une alerte dès que votre image est prête — même si vous êtes
              sur un autre onglet.
            </p>

            <ul className="mt-7">
              <li className="pv-row flex items-center justify-between gap-4 px-2 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">Son de notification</p>
                  <p className="mt-0.5 text-xs text-steel">Joue un son lorsque l&apos;image est prête</p>
                </div>
                <Switch
                  checked={notifSound}
                  onChange={setNotifSound}
                  aria-label="Activer le son de notification"
                />
              </li>
              <li className="pv-row flex items-center justify-between gap-4 px-2 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">Notification navigateur</p>
                  <p className="mt-0.5 text-xs text-steel">Alerte visible depuis un autre onglet</p>
                </div>
                <Switch
                  checked={notifBrowser}
                  onChange={handleBrowserNotifToggle}
                  aria-label="Activer les notifications du navigateur"
                />
              </li>
            </ul>

            <StatusMessage status={notifStatus} />
            <div className="mt-6 flex justify-end">
              <Button onClick={saveNotifications} disabled={notifSaving}>
                {notifSaving ? (
                  <><Loader2 size={13} className="animate-spin" />Enregistrement…</>
                ) : (
                  'Enregistrer les préférences'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── SÉCURITÉ ──────────────────────────────────────────── */}
        {activeTab === "security" && (
          <div className="flex flex-col gap-10 pt-9">
            <section>
              <h2 className="pv-display text-lg text-ink">Changer le mot de passe</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-steel">
                Six caractères minimum. La modification prend effet immédiatement.
              </p>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirmation</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <StatusMessage status={secStatus} />
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={changePassword}
                  disabled={secSaving || !newPassword || !confirmPassword}
                >
                  {secSaving ? (
                    <><Loader2 size={13} className="animate-spin" />Mise à jour…</>
                  ) : (
                    'Mettre à jour le mot de passe'
                  )}
                </Button>
              </div>
            </section>

            {/* Zone sensible — action volontairement non câblée */}
            <section className="rounded-xl border border-err/20 bg-err/[0.04] p-6">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-err/80">
                Zone sensible
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-steel">
                Une fois supprimé, votre compte et l&apos;ensemble de vos données
                sont définitivement effacés.
              </p>
              <Button variant="outline" disabled className="mt-5 border-err/30 text-err">
                Supprimer le compte
              </Button>
              <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-dusk">
                Indisponible pour le moment — contactez le support pour cette opération.
              </p>
            </section>
          </div>
        )}

        {/* ── APPARENCE — décoratif, rien n'est câblé ───────────── */}
        {activeTab === "appearance" && (
          <div className="pt-9">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="pv-display text-lg text-ink">Thème de l&apos;atelier</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dusk">
                Bientôt disponible
              </span>
            </div>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-steel">
              Le studio vit en Prisme. D&apos;autres ambiances arriveront
              prochainement — elles ne sont pas encore activables.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[rgba(109,91,232,0.35)] bg-[rgba(124,106,255,0.06)] p-4">
                <div className="h-12 rounded-lg border border-[color:var(--hairline)] bg-[#07070D]" />
                <p className="mt-3 text-[13px] font-medium text-ink">Prisme</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--num-color)]">
                  Actif
                </p>
              </div>
              <div className="rounded-xl border border-[color:var(--hairline)] p-4 opacity-55">
                <div className="h-12 rounded-lg border border-[color:var(--hairline)] bg-abyss" />
                <p className="mt-3 text-[13px] font-medium text-ink/70">Encre profonde</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dusk">
                  Bientôt disponible
                </p>
              </div>
              <div className="rounded-xl border border-[color:var(--hairline)] p-4 opacity-55">
                <div className="h-12 rounded-lg border border-[color:var(--hairline)] bg-white/90" />
                <p className="mt-3 text-[13px] font-medium text-ink/70">Ivoire jour</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dusk">
                  Bientôt disponible
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
