"use client"
import { useState, useRef } from "react"
import { User, Bell, Shield, Palette, Upload, Check, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { readApiResponse } from "@/lib/api/client"
import Image from "next/image"

const tabs = [
  { id: "profile",       label: "Profil",        icon: User },
  { id: "notifications", label: "Notifications",  icon: Bell },
  { id: "security",      label: "Sécurité",       icon: Shield },
  { id: "appearance",    label: "Apparence",      icon: Palette },
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-[#FF7B4B]" : "bg-white/10"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  )
}

function StatusMsg({ status }: { status: Status }) {
  if (!status) return null
  return (
    <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
      status.type === 'success'
        ? 'bg-[#4ADE80]/10 border border-[#4ADE80]/20 text-[#4ADE80]'
        : 'bg-red-500/10 border border-red-500/20 text-red-400'
    }`}>
      {status.type === 'success' ? <Check size={11} /> : <AlertCircle size={11} />}
      {status.message}
    </div>
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

  // ── Profile ──────────────────────────────────────────────────────────────────

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
      setProfileStatus({ type: 'success', message: 'Profil sauvegardé !' })
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
      setProfileStatus({ type: 'success', message: 'Photo de profil mise à jour !' })
    } catch (e: unknown) {
      setProfileStatus({ type: 'error', message: (e as Error).message ?? 'Erreur upload' })
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
          message: 'Notifications bloquées — autorise-les dans les paramètres du navigateur.',
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
      // Mirror to localStorage so DesignPageClient reads them instantly
      localStorage.setItem('neva_notif_sound', notifSound ? 'true' : 'false')
      localStorage.setItem('neva_notif_browser', notifBrowser ? 'true' : 'false')
      setNotifStatus({ type: 'success', message: 'Préférences sauvegardées !' })
    } catch (e: unknown) {
      setNotifStatus({ type: 'error', message: (e as Error).message ?? 'Erreur' })
    } finally {
      setNotifSaving(false)
    }
  }

  // ── Security ──────────────────────────────────────────────────────────────────

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
      setSecStatus({ type: 'success', message: 'Mot de passe mis à jour !' })
    } catch (e: unknown) {
      setSecStatus({ type: 'error', message: (e as Error).message ?? 'Erreur' })
    } finally {
      setSecSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-[#F5F0E8] mb-1">Paramètres</h1>
        <p className="text-sm text-[#666]">Gère ton compte et tes préférences.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
        {/* Tab list */}
        <div className="flex sm:flex-col gap-1 sm:w-44 sm:flex-shrink-0 overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0 border-b sm:border-b-0 border-white/[0.06]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white/[0.07] text-[#F5F0E8] font-medium"
                  : "text-[#666] hover:text-[#CCCCC0] hover:bg-white/[0.04]"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div className="flex-1 min-w-0">

          {/* ── PROFIL ── */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6">
              {/* Avatar upload */}
              <div className="glass-card rounded-2xl p-6 border border-white/[0.06]">
                <h3 className="text-sm font-semibold text-[#F5F0E8] mb-4">Photo de profil</h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="avatar" fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FF6B7D] to-[#FFD166] flex items-center justify-center text-2xl font-bold text-white">
                        {initials}
                      </div>
                    )}
                    {avatarUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                        <Loader2 size={16} className="animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                    >
                      <Upload size={12} className="mr-1.5" />
                      {avatarUploading ? 'Upload...' : 'Upload Photo'}
                    </Button>
                    <p className="text-xs text-[#555] mt-1.5">JPG, PNG ou WebP — max 4 Mo</p>
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
              </div>

              {/* Profile fields */}
              <div className="glass-card rounded-2xl p-6 border border-white/[0.06]">
                <h3 className="text-sm font-semibold text-[#F5F0E8] mb-5">Informations</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#9A9A9A] mb-1.5">
                      {"Nom d'affichage"}
                    </label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ton nom"
                      maxLength={100}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-[#F5F0E8] placeholder-[#444] outline-none focus:border-[#FF7B4B]/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9A9A9A] mb-1.5">Email</label>
                    <input
                      value={email}
                      readOnly
                      className="w-full px-3.5 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl text-sm text-[#555] outline-none cursor-default select-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9A9A9A] mb-1.5">Discord</label>
                    <input
                      value={discordHandle}
                      onChange={(e) => setDiscordHandle(e.target.value)}
                      placeholder="@username ou user#0001"
                      maxLength={50}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-[#F5F0E8] placeholder-[#444] outline-none focus:border-[#FF7B4B]/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9A9A9A] mb-1.5">Bio</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Parle-nous de tes projets FiveM..."
                      maxLength={500}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-[#F5F0E8] placeholder-[#444] outline-none focus:border-[#FF7B4B]/40 transition-colors resize-none"
                    />
                    <div className="text-right text-[10px] text-[#333] mt-1">{bio.length}/500</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-between mt-5 flex-wrap">
                  <StatusMsg status={profileStatus} />
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={saveProfile}
                    disabled={profileSaving}
                    className="ml-auto"
                  >
                    {profileSaving ? (
                      <><Loader2 size={11} className="animate-spin mr-1.5" />Sauvegarde...</>
                    ) : (
                      'Sauvegarder'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === "notifications" && (
            <div className="glass-card rounded-2xl p-6 border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-[#F5F0E8] mb-2">Notifications Neva Design</h3>
              <p className="text-xs text-[#555] mb-5 leading-relaxed">
                {"Reçois une alerte quand ton image est prête — même si tu es sur un autre onglet."}
              </p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between py-3.5 border-b border-white/[0.04]">
                  <div>
                    <div className="text-sm font-medium text-[#CCCCC0]">Son de notification</div>
                    <div className="text-xs text-[#555] mt-0.5">{"Joue un son quand l'image est prête"}</div>
                  </div>
                  <Toggle checked={notifSound} onChange={setNotifSound} />
                </div>
                <div className="flex items-center justify-between py-3.5">
                  <div>
                    <div className="text-sm font-medium text-[#CCCCC0]">Notification navigateur</div>
                    <div className="text-xs text-[#555] mt-0.5">Alerte visible sur un autre onglet</div>
                  </div>
                  <Toggle checked={notifBrowser} onChange={handleBrowserNotifToggle} />
                </div>
              </div>
              <div className="flex items-center gap-3 justify-between mt-5 flex-wrap">
                <StatusMsg status={notifStatus} />
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={saveNotifications}
                  disabled={notifSaving}
                  className="ml-auto"
                >
                  {notifSaving ? (
                    <><Loader2 size={11} className="animate-spin mr-1.5" />Sauvegarde...</>
                  ) : (
                    'Sauvegarder'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── SECURITE ── */}
          {activeTab === "security" && (
            <div className="flex flex-col gap-4">
              <div className="glass-card rounded-2xl p-6 border border-white/[0.06]">
                <h3 className="text-sm font-semibold text-[#F5F0E8] mb-5">Changer le mot de passe</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#9A9A9A] mb-1.5">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-[#F5F0E8] placeholder-[#444] outline-none focus:border-[#FF7B4B]/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9A9A9A] mb-1.5">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-[#F5F0E8] placeholder-[#444] outline-none focus:border-[#FF7B4B]/40 transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-3 justify-between flex-wrap">
                    <StatusMsg status={secStatus} />
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={changePassword}
                      disabled={secSaving || !newPassword || !confirmPassword}
                      className="ml-auto"
                    >
                      {secSaving ? (
                        <><Loader2 size={11} className="animate-spin mr-1.5" />Mise à jour...</>
                      ) : (
                        'Mettre à jour'
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-[#FF6B7D]/20 bg-[#FF6B7D]/5">
                <div className="text-sm font-semibold text-[#FF6B7D] mb-1">Zone dangereuse</div>
                <p className="text-xs text-[#9A9A9A] mb-4">
                  {"Une fois supprimé, ton compte et toutes tes données sont définitivement effacés."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#FF6B7D]/30 text-[#FF6B7D] hover:bg-[#FF6B7D]/10"
                >
                  Supprimer le compte
                </Button>
              </div>
            </div>
          )}

          {/* ── APPARENCE ── */}
          {activeTab === "appearance" && (
            <div className="glass-card rounded-2xl p-6 border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-[#F5F0E8] mb-5">Apparence</h3>
              <div>
                <div className="text-xs font-medium text-[#9A9A9A] mb-3">Thème</div>
                <div className="grid grid-cols-3 gap-3">
                  {["Sombre (défaut)", "Plus sombre", "OLED Noir"].map((theme, i) => (
                    <button
                      key={theme}
                      className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                        i === 0
                          ? "border-[#FF7B4B]/40 bg-[#FF7B4B]/10 text-[#FF7B4B]"
                          : "border-white/[0.06] text-[#666] hover:border-white/10 hover:text-[#CCCCC0]"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <div className="text-xs font-medium text-[#9A9A9A] mb-3">{"Couleur d'accent"}</div>
                <div className="flex gap-2">
                  {["#FF7B4B", "#FF6B7D", "#FFD166", "#FFB5C8", "#4ADE80", "#60A5FA"].map((color, i) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${i === 0 ? "ring-2 ring-offset-2 ring-offset-[#0f0f0f] ring-[#FF7B4B]" : ""}`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
