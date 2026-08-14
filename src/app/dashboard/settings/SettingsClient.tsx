"use client"
import { useEffect, useState, useRef } from "react"
import { Loader2, Upload, Unlink, ShieldCheck, ShieldOff } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FormMessage, Input, Label, Textarea } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { readApiResponse } from "@/lib/api/client"
import { backendFetch, BACKEND_URL } from "@/lib/api/backend-client"
import { getAccessToken } from "@/lib/session"

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

type DiscordIdentity = { username: string; avatarUrl: string | null }

interface Props {
  email: string
  initialDisplayName: string
  initialAvatarUrl: string | null
  initialDiscord: DiscordIdentity | null
  initialBio: string
  initialNotificationPrefs: Record<string, unknown>
  initialMfaEnabled: boolean
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
  initialDiscord,
  initialBio,
  initialNotificationPrefs,
  initialMfaEnabled,
}: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")

  // Profile state
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [bio, setBio] = useState(initialBio)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileStatus, setProfileStatus] = useState<Status>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Discord linking state
  const [discord, setDiscord] = useState(initialDiscord)
  const [discordUnlinking, setDiscordUnlinking] = useState(false)
  const [discordStatus, setDiscordStatus] = useState<Status>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("discordError")) {
      setDiscordStatus({ type: "error", message: "La connexion à Discord a échoué. Réessayez." })
      router.replace("/dashboard/settings")
    } else if (params.get("discordLinked")) {
      setDiscordStatus({ type: "success", message: "Discord connecté." })
      router.replace("/dashboard/settings")
    }
  }, [router])

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

  // Email change state
  const [newEmail, setNewEmail] = useState("")
  const [emailPassword, setEmailPassword] = useState("")
  const [emailCode, setEmailCode] = useState("")
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailStatus, setEmailStatus] = useState<Status>(null)

  // 2FA (TOTP) state
  const [mfaEnabled, setMfaEnabled] = useState(initialMfaEnabled)
  const [mfaEnrolling, setMfaEnrolling] = useState(false)
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null)
  const [mfaSecret, setMfaSecret] = useState<string | null>(null)
  const [mfaVerifyCode, setMfaVerifyCode] = useState("")
  const [mfaDisableCode, setMfaDisableCode] = useState("")
  const [mfaSaving, setMfaSaving] = useState(false)
  const [mfaStatus, setMfaStatus] = useState<Status>(null)

  const initials = (displayName || email).charAt(0).toUpperCase()

  // ── Profil ────────────────────────────────────────────────────────────────────

  const saveProfile = async () => {
    setProfileSaving(true)
    setProfileStatus(null)
    try {
      const res = await backendFetch('/profile', {
        method: 'PATCH',
        body: JSON.stringify({ display_name: displayName, bio }),
      })
      await readApiResponse<{ ok: boolean }>(res)
      setProfileStatus({ type: 'success', message: 'Profil enregistré.' })
    } catch (e: unknown) {
      setProfileStatus({ type: 'error', message: (e as Error).message ?? 'Erreur' })
    } finally {
      setProfileSaving(false)
    }
  }

  // ── Discord ───────────────────────────────────────────────────────────────────

  const connectDiscord = () => {
    const token = getAccessToken()
    if (!token) return
    window.location.href = `${BACKEND_URL}/profile/discord/link?token=${encodeURIComponent(token)}`
  }

  const disconnectDiscord = async () => {
    setDiscordUnlinking(true)
    setDiscordStatus(null)
    try {
      const res = await backendFetch('/profile/discord/unlink', { method: 'POST' })
      await readApiResponse<{ success: boolean }>(res)
      setDiscord(null)
      setDiscordStatus({ type: 'success', message: 'Discord déconnecté.' })
    } catch (e: unknown) {
      setDiscordStatus({ type: 'error', message: (e as Error).message ?? 'Erreur' })
    } finally {
      setDiscordUnlinking(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    setAvatarUploading(true)
    setProfileStatus(null)
    try {
      const form = new FormData()
      form.append('avatar', file)
      const res = await backendFetch('/profile/avatar', { method: 'POST', body: form })
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
      const res = await backendFetch('/profile', {
        method: 'PATCH',
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
      const res = await backendFetch('/profile/password', {
        method: 'POST',
        body: JSON.stringify({ password: newPassword }),
      })
      await readApiResponse<{ success: boolean }>(res)
      setNewPassword('')
      setConfirmPassword('')
      setSecStatus({ type: 'success', message: 'Mot de passe mis à jour.' })
    } catch (e: unknown) {
      setSecStatus({ type: 'error', message: (e as Error).message ?? 'Erreur' })
    } finally {
      setSecSaving(false)
    }
  }

  // ── Changement d'e-mail ──────────────────────────────────────────────────────

  const changeEmail = async () => {
    if (!newEmail) return
    setEmailSaving(true)
    setEmailStatus(null)
    try {
      const body: Record<string, string> = { newEmail }
      if (mfaEnabled) {
        body.code = emailCode
      } else {
        body.password = emailPassword
      }
      const res = await backendFetch('/profile/email', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const data = await readApiResponse<{ success: boolean; message?: string }>(res)
      setEmailStatus({
        type: 'success',
        message: data.message ?? 'Vérifie ta boîte mail pour confirmer le changement.',
      })
      setNewEmail("")
      setEmailPassword("")
      setEmailCode("")
    } catch (e: unknown) {
      setEmailStatus({ type: 'error', message: (e as Error).message ?? 'Erreur' })
    } finally {
      setEmailSaving(false)
    }
  }

  // ── A2F (TOTP) ────────────────────────────────────────────────────────────────

  const startMfaEnroll = async () => {
    setMfaSaving(true)
    setMfaStatus(null)
    try {
      const res = await backendFetch('/profile/2fa/enroll', { method: 'POST' })
      const data = await readApiResponse<{ factorId: string; qrCode: string; secret: string }>(res)
      setMfaFactorId(data.factorId)
      setMfaQrCode(data.qrCode)
      setMfaSecret(data.secret)
      setMfaEnrolling(true)
    } catch (e: unknown) {
      setMfaStatus({ type: 'error', message: (e as Error).message ?? 'Erreur' })
    } finally {
      setMfaSaving(false)
    }
  }

  const confirmMfaEnroll = async () => {
    if (!mfaFactorId || !mfaVerifyCode) return
    setMfaSaving(true)
    setMfaStatus(null)
    try {
      const res = await backendFetch('/profile/2fa/enroll/verify', {
        method: 'POST',
        body: JSON.stringify({ factorId: mfaFactorId, code: mfaVerifyCode }),
      })
      await readApiResponse<{ success: boolean }>(res)
      setMfaEnabled(true)
      setMfaEnrolling(false)
      setMfaFactorId(null)
      setMfaQrCode(null)
      setMfaSecret(null)
      setMfaVerifyCode("")
      setMfaStatus({ type: 'success', message: 'A2F activée.' })
    } catch (e: unknown) {
      setMfaStatus({ type: 'error', message: (e as Error).message ?? 'Code invalide' })
    } finally {
      setMfaSaving(false)
    }
  }

  const cancelMfaEnroll = () => {
    setMfaEnrolling(false)
    setMfaFactorId(null)
    setMfaQrCode(null)
    setMfaSecret(null)
    setMfaVerifyCode("")
    setMfaStatus(null)
  }

  const disableMfa = async () => {
    if (!mfaDisableCode) return
    setMfaSaving(true)
    setMfaStatus(null)
    try {
      const res = await backendFetch('/profile/2fa/disable', {
        method: 'POST',
        body: JSON.stringify({ code: mfaDisableCode }),
      })
      await readApiResponse<{ success: boolean }>(res)
      setMfaEnabled(false)
      setMfaDisableCode("")
      setMfaStatus({ type: 'success', message: 'A2F désactivée.' })
    } catch (e: unknown) {
      setMfaStatus({ type: 'error', message: (e as Error).message ?? 'Code invalide' })
    } finally {
      setMfaSaving(false)
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
                    active ? "text-[color:var(--num-color)]" : "text-ink/40"
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
                    <div className="flex h-full w-full items-center justify-center bg-[rgba(164,139,232,0.08)]">
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
                    <div className="mb-2 flex items-baseline justify-between">
                      <Label htmlFor="settings-email" className="mb-0">
                        Adresse e-mail
                      </Label>
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-dusk">
                        Identifiant du compte
                      </span>
                    </div>
                    {/* valeur réelle : encre pleine, jamais l'allure
                        d'un placeholder (D42) */}
                    <Input
                      id="settings-email"
                      value={email}
                      readOnly
                      className="cursor-default select-all bg-[rgba(43,36,80,0.03)] text-ink"
                    />
                  </div>
                </div>
                <div>
                  <Label>Discord</Label>
                  {discord ? (
                    <div className="flex items-center gap-3 rounded-[12px] border border-[color:var(--hairline)] bg-white/60 px-4 py-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#5865F2]/10">
                        {discord.avatarUrl ? (
                          <Image src={discord.avatarUrl} alt="" width={36} height={36} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 127.14 96.36" aria-hidden>
                              <path fill="#5865F2" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{discord.username}</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ok">Connecté</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={disconnectDiscord}
                        disabled={discordUnlinking}
                      >
                        {discordUnlinking ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Unlink size={13} />
                        )}
                        Déconnecter
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" variant="secondary" onClick={connectDiscord}>
                      <svg width="14" height="14" viewBox="0 0 127.14 96.36" aria-hidden>
                        <path fill="#5865F2" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                      </svg>
                      Connecter Discord
                    </Button>
                  )}
                  <StatusMessage status={discordStatus} />
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
              {/* barre d'action ancrée à la carte du formulaire (D42) */}
              <div className="mt-8 flex justify-end border-t border-[color:var(--hairline)] pt-5">
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
              <h2 className="pv-display text-lg text-ink">Changer d&apos;adresse e-mail</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-steel">
                {mfaEnabled
                  ? "Confirmez avec un code A2F. Un lien de confirmation sera envoyé à la nouvelle adresse."
                  : "Confirmez avec votre mot de passe actuel. Un lien de confirmation sera envoyé à la nouvelle adresse."}
              </p>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="new-email">Nouvelle adresse e-mail</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nouvelle@adresse.com"
                  />
                </div>
                {mfaEnabled ? (
                  <div>
                    <Label htmlFor="email-mfa-code">Code A2F</Label>
                    <Input
                      id="email-mfa-code"
                      inputMode="numeric"
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="email-password">Mot de passe actuel</Label>
                    <Input
                      id="email-password"
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                )}
              </div>

              <StatusMessage status={emailStatus} />
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={changeEmail}
                  disabled={
                    emailSaving ||
                    !newEmail ||
                    (mfaEnabled ? emailCode.length < 6 : !emailPassword)
                  }
                >
                  {emailSaving ? (
                    <><Loader2 size={13} className="animate-spin" />Envoi…</>
                  ) : (
                    "Changer l'adresse e-mail"
                  )}
                </Button>
              </div>
            </section>

            <section className="border-t border-[color:var(--hairline)] pt-9">
              <h2 className="pv-display text-lg text-ink">Authentification à deux facteurs</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-steel">
                Ajoutez un code temporaire (application d&apos;authentification) en plus de votre
                mot de passe.
              </p>

              {mfaEnabled ? (
                <div className="mt-6">
                  <div className="flex items-center gap-3 rounded-[12px] border border-ok/30 bg-ok/[0.06] px-4 py-3">
                    <ShieldCheck size={18} className="shrink-0 text-ok" />
                    <p className="text-sm font-medium text-ink">A2F activée sur ce compte</p>
                  </div>
                  <div className="mt-5 grid max-w-sm gap-3">
                    <div>
                      <Label htmlFor="mfa-disable-code">Code A2F pour désactiver</Label>
                      <Input
                        id="mfa-disable-code"
                        inputMode="numeric"
                        value={mfaDisableCode}
                        onChange={(e) => setMfaDisableCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-err/30 text-err"
                      onClick={disableMfa}
                      disabled={mfaSaving || mfaDisableCode.length < 6}
                    >
                      {mfaSaving ? (
                        <><Loader2 size={13} className="animate-spin" />Désactivation…</>
                      ) : (
                        <><ShieldOff size={13} />Désactiver l&apos;A2F</>
                      )}
                    </Button>
                  </div>
                </div>
              ) : mfaEnrolling ? (
                <div className="mt-6 flex flex-col gap-5 rounded-[12px] border border-[color:var(--hairline)] bg-white/60 p-5 sm:flex-row sm:items-start">
                  {mfaQrCode && (
                    <div className="h-[176px] w-[176px] shrink-0 overflow-hidden rounded-lg border border-[color:var(--hairline)] bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mfaQrCode.startsWith('<') ? `data:image/svg+xml;utf8,${encodeURIComponent(mfaQrCode)}` : mfaQrCode}
                        alt="QR code A2F"
                        width={160}
                        height={160}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">
                      Scannez ce QR code avec votre application d&apos;authentification (Google
                      Authenticator, Authy…), ou saisissez la clé manuellement :
                    </p>
                    {mfaSecret && (
                      <p className="mt-2 select-all break-all rounded-md bg-[rgba(43,36,80,0.05)] px-3 py-2 font-mono text-[11px] tracking-[0.05em] text-ink">
                        {mfaSecret}
                      </p>
                    )}
                    <div className="mt-4 max-w-[200px]">
                      <Label htmlFor="mfa-verify-code">Code de vérification</Label>
                      <Input
                        id="mfa-verify-code"
                        inputMode="numeric"
                        value={mfaVerifyCode}
                        onChange={(e) => setMfaVerifyCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                      />
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Button
                        type="button"
                        onClick={confirmMfaEnroll}
                        disabled={mfaSaving || mfaVerifyCode.length < 6}
                      >
                        {mfaSaving ? (
                          <><Loader2 size={13} className="animate-spin" />Vérification…</>
                        ) : (
                          'Confirmer'
                        )}
                      </Button>
                      <Button type="button" variant="secondary" onClick={cancelMfaEnroll} disabled={mfaSaving}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <Button type="button" variant="secondary" onClick={startMfaEnroll} disabled={mfaSaving}>
                    {mfaSaving ? (
                      <><Loader2 size={13} className="animate-spin" />Préparation…</>
                    ) : (
                      <><ShieldCheck size={13} />Activer l&apos;A2F</>
                    )}
                  </Button>
                </div>
              )}
              <StatusMessage status={mfaStatus} />
            </section>

            <section className="border-t border-[color:var(--hairline)] pt-9">
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
              <div className="rounded-xl border border-[rgba(164,139,232,0.35)] bg-[rgba(164,139,232,0.06)] p-4">
                <div className="h-12 rounded-lg border border-[color:var(--hairline)] bg-[#241F45]" />
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
