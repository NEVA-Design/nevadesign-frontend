"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Download, ImageIcon, Paperclip, Plus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { IMAGE_BRIEF_MARKER, NEVA_MODELS, type NevaModel } from "@/lib/ai/models";
import { backendFetch } from "@/lib/api/backend-client";

/*
 * Creative Director — salon de conversation plein écran : en-tête fin
 * sur filet, fil éditorial (réponses posées sur la nuit, messages
 * utilisateur en carte sobre à droite), saisie creusée posée sur un
 * filet. Une seule lumière : violet.
 */

interface Attachment {
  data: string;
  mimeType: string;
  preview: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date | string;
  image?: string;
  canGenerateImage?: boolean;
  generatingImage?: boolean;
  attachments?: Attachment[];
}

interface StoredMessage extends Omit<Message, "timestamp"> {
  timestamp?: string;
}

const INTRO_MESSAGE =
  "Dites-moi ce que vous voulez publier : bannière, logo, landing page ou identité serveur. Je vous réponds avec un angle clair, un format et un prompt prêt à lancer.";

const suggestions = [
  "Améliore mon prompt d'affiche",
  "Trouve un concept de lancement",
  "Crée une direction artistique",
  "Optimise une annonce Discord",
];

const modelList = Object.values(NEVA_MODELS);

/* Badges des modèles — tokens Prisme uniquement. */
const BADGE_STYLES: Record<string, string> = {
  STUDIO: "border-[rgba(164,139,232,0.3)] bg-[rgba(164,139,232,0.08)] text-[color:var(--num-color)]",
  CORE: "border-info/30 bg-info/10 text-info",
};
const BADGE_FALLBACK = "border-[color:var(--hairline-strong)] bg-linen text-steel";

const IMAGE_INTENT_PATTERN =
  /\b(génère|genere|crée|cree|produis|fais-moi).*\b(image|visuel|poster|affiche|bannière|banniere|banner|miniature|thumbnail|logo|cover|flyer|pub|ad|maquette|mockup)\b|\b(image|visuel|poster|affiche|bannière|banniere|banner|miniature|thumbnail|logo|cover|flyer|mockup)\b/i;

function cleanAssistantText(content: string) {
  return content
    .replaceAll(IMAGE_BRIEF_MARKER, "")
    .replace(/\[\[NEVA(?:_[A-Z]+)*\]?]?$/g, "")
    .trim();
}

function hasImageIntent(content: string) {
  return IMAGE_INTENT_PATTERN.test(content);
}

function formatTime(date: Date | string) {
  const parsed = typeof date === "string" ? new Date(date) : date;
  const h = parsed.getHours().toString().padStart(2, "0");
  const m = parsed.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

// ─── Mini-parseur markdown en ligne ──────────────────────────────────────────

function formatInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      return (
        <a
          key={i}
          href={link[2]}
          className="text-[color:var(--num-color)] underline decoration-violet/40 underline-offset-2 transition-colors duration-300 hover:text-ink"
        >
          {link[1]}
        </a>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**")) {
      return (
        <em key={i} className="italic text-steel">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={i}
          className="mx-0.5 rounded-full border border-[color:var(--hairline)] bg-abyss px-1.5 py-0.5 font-mono text-[11px] text-[color:var(--num-color)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function MessageContent({ content, variant }: { content: string; variant: "user" | "assistant" }) {
  const cleanContent = cleanAssistantText(content);

  if (variant === "user") {
    return <>{cleanContent}</>;
  }

  const lines = cleanContent.split("\n").map((l) => l.trim()).filter(Boolean);

  if (lines.length === 0) return <>{cleanContent}</>;

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const h2 = line.match(/^## (.+)/);
        const h3 = line.match(/^### (.+)/);
        const numbered = line.match(/^(\d+)[.)]\s+(.+)/);
        const bullet = line.match(/^[-•*]\s+(.+)/);
        const hr = /^---+$/.test(line);
        const sectionHead = line.endsWith(":") && line.length < 62 && !line.startsWith("-") && !line.startsWith("*");

        if (h2) return (
          <div
            key={index}
            className="pv-display border-t border-[color:var(--hairline)] pt-3 text-[15px] text-ink first:border-t-0 first:pt-0"
          >
            {formatInline(h2[1])}
          </div>
        );

        if (h3) return (
          <div key={index} className="pv-display pt-1.5 text-[14px] text-ink/85 first:pt-0">
            {formatInline(h3[1])}
          </div>
        );

        if (hr) return <div key={index} aria-hidden className="my-2 border-t border-[color:var(--hairline)]" />;

        if (sectionHead) return (
          <div key={index} className="pv-display pt-2 text-[14px] text-ink first:pt-0">
            {formatInline(line.slice(0, -1))}
          </div>
        );

        if (numbered) return (
          <div key={index} className="flex gap-3">
            <span className="pv-num w-6 shrink-0 pt-[3px] text-right">{numbered[1]}.</span>
            <span className="leading-relaxed">{formatInline(numbered[2])}</span>
          </div>
        );

        if (bullet) return (
          <div key={index} className="flex gap-3">
            <span aria-hidden className="mt-[10px] h-px w-3.5 shrink-0 bg-violet/50" />
            <span className="leading-relaxed">{formatInline(bullet[1])}</span>
          </div>
        );

        return (
          <p key={index} className="leading-relaxed">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}

/* Monogramme du directeur artistique — serif en veilleuse violet. */
function AssistantAvatar() {
  return (
    <div
      aria-hidden
      className="mt-0.5 flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border border-violet/25 bg-[rgba(164,139,232,0.08)]"
    >
      <span className="pv-display text-[13px] text-[color:var(--num-color)]">N</span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: INTRO_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedModel, setSelectedModel] = useState<NevaModel>(modelList[0]);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await backendFetch("/chat/history");
        if (!res.ok) return;
        const data = await res.json();
        if (data?.messages?.length) {
          setMessages(
            data.messages.map((message: StoredMessage) => ({
              ...message,
              timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
              attachments: message.attachments?.map((attachment: Attachment) => ({
                ...attachment,
                preview: attachment.preview ?? `data:${attachment.mimeType};base64,${attachment.data}`,
              })),
            }))
          );
        }
      } catch (error) {
        console.warn("Unable to load chat history", error);
      } finally {
        setHistoryLoaded(true);
      }
    };

    if (!historyLoaded) loadHistory();
  }, [historyLoaded]);

  const persistHistory = async (messagesToSave: Message[]) => {
    try {
      await backendFetch("/chat/history", {
        method: "POST",
        body: JSON.stringify({ messages: messagesToSave }),
      });
    } catch (error) {
      console.warn("Unable to persist chat history", error);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .slice(0, 4 - pendingAttachments.length)
      .forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setPendingAttachments((prev) => [
            ...prev,
            { data: dataUrl.split(",")[1], mimeType: file.type, preview: dataUrl },
          ]);
        };
        reader.readAsDataURL(file);
      });
  };

  const generateImageFromMessage = async (msgIndex: number, prompt: string) => {
    setMessages((prev) =>
      prev.map((m, i) => (i === msgIndex ? { ...m, generatingImage: true } : m))
    );
    try {
      const res = await backendFetch("/generate-image", {
        method: "POST",
        body: JSON.stringify({ prompt, aspectRatio: "16:9", resolution: "hd", imageModelId: "neva-standard" }),
      });
      const data = await res.json();
      setMessages((prev) => {
        const updated = prev.map((m, i) =>
          i === msgIndex
            ? { ...m, image: data.image ?? null, generatingImage: false, canGenerateImage: false }
            : m
        );
        persistHistory(updated);
        return updated;
      });
    } catch {
      setMessages((prev) =>
        prev.map((m, i) => (i === msgIndex ? { ...m, generatingImage: false } : m))
      );
    }
  };

  const handleGenerateImage = async () => {
    const content =
      input.trim() ||
      (pendingAttachments.length > 0
        ? "Génère un visuel marketing cinématique pour un serveur FiveM premium."
        : "");
    if (!content || isLoading || isGeneratingImage) return;

    setIsGeneratingImage(true);
    const referenceImages = [...pendingAttachments];
    setInput("");
    setPendingAttachments([]);

    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date(),
      attachments: referenceImages,
    };
    const placeholder: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
      generatingImage: true,
    };

    setMessages((prev) => [...prev, userMessage, placeholder]);
    const placeholderIdx = messages.length + 1;

    try {
      const res = await backendFetch("/generate-image", {
        method: "POST",
        body: JSON.stringify({
          prompt: content,
          aspectRatio: "16:9",
          resolution: "hd",
          imageModelId: "neva-standard",
          ...(referenceImages.length > 0 && {
            referenceImage: { data: referenceImages[0].data, mimeType: referenceImages[0].mimeType },
          }),
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages((prev) =>
          prev.map((m, i) =>
            i === placeholderIdx
              ? { ...m, content: data.error ?? "Erreur lors de la génération.", generatingImage: false }
              : m
          )
        );
        return;
      }

      setMessages((prev) => {
        const updated = prev.map((m, i) =>
          i === placeholderIdx
            ? {
                ...m,
                content: `Voici le visuel généré pour : *${content.slice(0, 80)}${content.length > 80 ? "…" : ""}*`,
                image: data.image,
                generatingImage: false,
              }
            : m
        );
        persistHistory(updated);
        return updated;
      });
    } catch {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === placeholderIdx
            ? { ...m, content: "Erreur réseau. Réessayez.", generatingImage: false }
            : m
        )
      );
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if ((!content && pendingAttachments.length === 0) || isLoading) return;

    const attachments = [...pendingAttachments];
    setInput("");
    setPendingAttachments([]);

    const userMessage: Message = {
      role: "user",
      content: content || "📎",
      timestamp: new Date(),
      attachments,
    };
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setStreamingContent("");

    try {
      const res = await backendFetch("/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments?.map((a) => ({ data: a.data, mimeType: a.mimeType })),
          })),
          modelId: selectedModel.id,
          module: "chat",
        }),
      });

      if (res.status === 402) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Vos créations disponibles sont épuisées. Rechargez votre espace dans [Abonnement](/dashboard/billing) pour continuer.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      if (!res.ok || !res.body) {
        let errorMsg = "Une erreur est survenue. Réessayez dans un instant.";
        try {
          const errData = await res.json();
          if (errData?.error) errorMsg = `Erreur : ${errData.error}`;
        } catch { /* non-JSON */ }
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: errorMsg, timestamp: new Date() },
        ]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamingContent(cleanAssistantText(accumulated));
      }

      const canGenerateImage = accumulated.includes(IMAGE_BRIEF_MARKER);
      const cleanText = cleanAssistantText(accumulated);
      const assistantIdx = newMessages.length;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: cleanText,
          canGenerateImage,
          generatingImage: canGenerateImage,
          timestamp: new Date(),
        },
      ]);

      if (canGenerateImage) {
        generateImageFromMessage(assistantIdx, cleanText);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Une erreur est survenue. Réessayez dans un instant.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setStreamingContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: INTRO_MESSAGE,
        timestamp: new Date(),
      },
    ]);
    setStreamingContent("");
    setPendingAttachments([]);
  };

  return (
    <div
      className="relative flex h-[calc(100dvh-3.5rem)] min-h-0 w-full flex-col overflow-hidden lg:h-dvh"
      onClick={() => setModelPickerOpen(false)}
    >
      {/* Halo — la profondeur de la scène, jamais de noir nu */}
      <div
        aria-hidden
        className="pv-halo--violet pv-halo left-1/2 top-[-180px] h-[400px] w-[640px] -translate-x-1/2"
      />

      {/* ── En-tête fin sur filet ─────────────────────────────── */}
      <header className="relative z-20 flex h-[60px] shrink-0 items-center justify-between gap-3 border-b border-[color:var(--hairline)] px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3.5">
          <h1 className="pv-display truncate text-[17px] text-ink sm:text-lg">
            Creative <span className="pv-beam-underline font-medium text-ink">Director</span>
          </h1>
          <span aria-hidden className="hidden h-4 w-px shrink-0 bg-[color:var(--hairline-strong)] md:block" />
          <p className="hidden truncate font-mono text-[10px] uppercase tracking-[0.14em] text-dusk md:block">
            Stratégie · prompts · identité · lancements
          </p>
          <span className="hidden shrink-0 items-center gap-2 sm:flex">
            <span aria-hidden className="pv-breathe h-1.5 w-1.5 rounded-full bg-ok" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ok/80">En ligne</span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Sélecteur de modèle */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setModelPickerOpen((v) => !v)}
              aria-expanded={modelPickerOpen}
              aria-haspopup="listbox"
              className="flex min-h-[40px] items-center gap-2 rounded-lg border border-[color:var(--hairline-strong)] bg-white/5 px-3 text-[13px] text-ink/80 transition-colors duration-300 hover:border-[rgba(164,139,232,0.35)] hover:text-ink"
            >
              <span
                className={`rounded-full border px-1.5 py-px font-mono text-[9px] font-medium uppercase tracking-[0.14em] ${
                  BADGE_STYLES[selectedModel.badge] ?? BADGE_FALLBACK
                }`}
              >
                {selectedModel.badge}
              </span>
              <span className="max-w-[110px] truncate font-medium">{selectedModel.name}</span>
              <ChevronDown
                size={12}
                className={`text-dusk transition-transform duration-300 ${modelPickerOpen ? "rotate-180" : ""}`}
              />
            </button>

            {modelPickerOpen && (
              <div className="pv-scale-in absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-[color:var(--hairline-strong)] bg-abyss shadow-[var(--shadow-float)]">
                <p className="pv-label border-b border-[color:var(--hairline)] px-4 py-2.5">
                  Modèle de direction
                </p>
                {modelList.map((m) => {
                  const isActive = selectedModel.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m);
                        setModelPickerOpen(false);
                      }}
                      className={`flex w-full items-start gap-2.5 border-b border-[color:var(--hairline)] px-4 py-3 text-left transition-colors duration-300 last:border-b-0 hover:bg-ink/[0.04] ${
                        isActive ? "bg-[rgba(164,139,232,0.06)]" : ""
                      }`}
                    >
                      <span
                        className={`mt-0.5 shrink-0 rounded-full border px-1.5 py-px font-mono text-[9px] font-medium uppercase tracking-[0.14em] ${
                          BADGE_STYLES[m.badge] ?? BADGE_FALLBACK
                        }`}
                      >
                        {m.badge}
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-[13px] font-medium ${isActive ? "text-[color:var(--num-color)]" : "text-ink/85"}`}>
                          {m.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-steel">
                          {m.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="min-h-[40px] gap-1.5 px-3"
            onClick={resetChat}
            aria-label="Nouvelle conversation"
          >
            <Plus size={14} />
            <span className="hidden md:inline">Nouvelle conversation</span>
          </Button>
        </div>
      </header>

      {/* ── Fil de messages éditorial ─────────────────────────── */}
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6">
        {/* filigrane ΛV — le vide de l'accueil est composé (D40) */}
        <svg aria-hidden viewBox="0 0 1441 1000" className="pointer-events-none absolute left-1/2 top-1/2 w-[420px] -translate-x-1/2 -translate-y-1/2 fill-[rgba(255,255,255,0.05)]"><path d="M440.2 0 L864.6 1000 L694.6 1000 L441 379 L180.1 1000 L0 1000 Z" /><path d="M439.5 710 L559.2 1000 L320 1000 Z" /><path d="M575 0 L755.1 0 L1013 618 L1266.6 0 L1438.1 0 L1015.2 990 Z" /><path d="M893.4 0 L1134.1 0 L1013.7 292 Z" /></svg>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
          {messages.map((msg, i) =>
            msg.role === "user" ? (
              <div key={i} className="flex flex-col items-end gap-1.5">
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {msg.attachments.map((att, ai) => (
                      <div
                        key={ai}
                        className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[color:var(--hairline)] bg-abyss"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={att.preview} alt="Image de référence" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {msg.content && msg.content !== "📎" && (
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-xl rounded-br-[2px] border border-[color:var(--hairline)] bg-white/5 px-4 py-3 text-sm leading-relaxed text-ink/90 shadow-[var(--shadow-print)]">
                    <MessageContent content={msg.content} variant="user" />
                  </div>
                )}

                <span className="font-mono text-[10px] text-ink/25">{formatTime(msg.timestamp)}</span>
              </div>
            ) : (
              <div key={i} className="flex gap-3">
                <AssistantAvatar />
                <div className="min-w-0 flex-1 space-y-2.5 pt-1">
                  {msg.content && msg.content !== "📎" && (
                    <div className="text-sm leading-relaxed text-ink/80">
                      <MessageContent content={msg.content} variant="assistant" />
                    </div>
                  )}

                  {/* Visuel généré */}
                  {msg.image && (
                    <div className="max-w-sm overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-abyss">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={msg.image} alt="Visuel généré" className="block h-auto w-full" />
                      <div className="flex items-center justify-between gap-3 border-t border-[color:var(--hairline)] py-1 pl-3.5 pr-1.5">
                        <span className="font-mono text-[10px] tracking-[0.08em] text-dusk">
                          Généré par Neva
                        </span>
                        <button
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = msg.image!;
                            a.download = `neva-${Date.now()}.webp`;
                            a.click();
                          }}
                          className="flex min-h-[40px] items-center gap-1.5 rounded-lg px-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--num-color)] transition-colors duration-300 hover:text-ink"
                        >
                          <Download size={11} />
                          Télécharger
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.generatingImage && (
                    <div className="flex w-fit items-center gap-2.5 rounded-xl border border-violet/20 bg-violet/5 px-3.5 py-2.5 text-xs text-steel">
                      <Spinner className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Génération de l&apos;image en cours…
                        <span className="ml-1 text-dusk">· incluse selon votre abonnement</span>
                      </span>
                    </div>
                  )}

                  {msg.canGenerateImage && !msg.image && !msg.generatingImage && i > 0 && (
                    <button
                      onClick={() => generateImageFromMessage(i, cleanAssistantText(msg.content))}
                      className="flex min-h-[40px] w-fit items-center gap-2 rounded-lg border border-[color:var(--hairline-strong)] px-3.5 font-mono text-[10px] uppercase tracking-[0.12em] text-steel transition-colors duration-300 hover:border-violet/45 hover:text-[color:var(--num-color)]"
                    >
                      <ImageIcon size={12} />
                      Régénérer l&apos;image
                    </button>
                  )}

                  <span className="block font-mono text-[10px] text-ink/25">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            )
          )}

          {isLoading && (
            <div className="flex gap-3">
              <AssistantAvatar />
              <div className="min-w-0 flex-1 pt-1">
                {streamingContent ? (
                  <div className="text-sm leading-relaxed text-ink/80">
                    <MessageContent content={streamingContent} variant="assistant" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 py-1.5">
                    <Spinner className="h-3.5 w-3.5" />
                    <span className="pv-meta">Rédaction en cours…</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Suggestions d'ouverture ───────────────────────────── */}
      {messages.length === 1 && !isLoading && (
        <div className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-3 sm:px-6">
          <p className="pv-label mb-2.5">Pour commencer</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, index) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="flex min-h-[40px] items-center gap-2.5 rounded-lg border border-[color:var(--hairline)] px-3.5 text-xs text-steel transition-colors duration-300 hover:border-[rgba(164,139,232,0.35)] hover:text-[color:var(--num-color)]"
              >
                <span className="pv-num text-[10px]">0{index + 1}</span>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Saisie posée sur filet ────────────────────────────── */}
      <div className="relative z-10 shrink-0 border-t border-[color:var(--hairline)]">
        <div className="mx-auto w-full max-w-3xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3.5 sm:px-6">
          {pendingAttachments.length > 0 && (
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              {pendingAttachments.map((att, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  title="Retirer cette image"
                  className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[rgba(164,139,232,0.28)] transition-colors duration-300 hover:border-err/60"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={att.preview} alt="Image de référence" className="h-full w-full object-cover" />
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center bg-ink/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  >
                    <X size={12} className="text-ink" />
                  </span>
                  <span
                    aria-hidden
                    className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl-[6px] bg-[rgba(28,23,55,0.8)]"
                  >
                    <X size={8} className="text-ink/70" />
                  </span>
                </button>
              ))}
              <span className="font-mono text-[10px] tracking-[0.08em] text-dusk">
                {pendingAttachments.length} image{pendingAttachments.length > 1 ? "s" : ""} de référence · 4 au maximum
              </span>
            </div>
          )}

          <div className="flex items-end gap-1.5 rounded-xl border border-[color:var(--hairline-strong)] bg-abyss px-2 py-1.5 transition-[border-color,box-shadow] duration-300 focus-within:border-[rgba(164,139,232,0.5)] focus-within:shadow-[0_0_0_3px_rgba(164,139,232,0.12)]">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={pendingAttachments.length >= 4}
              title="Ajouter une image de référence"
              aria-label="Ajouter une image de référence"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-steel transition-colors duration-300 hover:bg-ink/5 hover:text-[color:var(--num-color)] disabled:opacity-30"
            >
              <Paperclip size={15} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                pendingAttachments.length > 0
                  ? "Décrivez l'objectif créatif avec ces références…"
                  : "Demandez une direction artistique, un prompt ou une idée de campagne…"
              }
              rows={1}
              className="max-h-[120px] min-h-[24px] flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed text-[#F6F3EE] outline-none placeholder:text-[rgba(246,243,238,0.42)]"
            />
            {(pendingAttachments.length > 0 || hasImageIntent(input)) && (
              <button
                onClick={() => handleGenerateImage()}
                disabled={
                  (!input.trim() && pendingAttachments.length === 0) || isLoading || isGeneratingImage
                }
                title="Générer un visuel"
                aria-label="Générer un visuel"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--hairline-strong)] text-steel transition-colors duration-300 hover:border-[rgba(164,139,232,0.45)] hover:text-[color:var(--num-color)] disabled:opacity-30"
              >
                <ImageIcon size={14} />
              </button>
            )}
            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && pendingAttachments.length === 0) || isLoading}
              aria-label="Envoyer le message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-[#060606] shadow-[0_1px_2px_rgba(0,0,0,0.44)] transition-colors duration-300 hover:bg-white disabled:opacity-30"
            >
              <Send size={13} />
            </button>
          </div>

          <p className="mt-2.5 text-center font-mono text-[10px] tracking-[0.08em] text-ink/25">
            {selectedModel.name} · Entrée pour envoyer · Maj + Entrée pour une nouvelle ligne
          </p>
        </div>
      </div>
    </div>
  );
}
