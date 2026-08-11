"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Plus, Sparkles, MessageSquare, ChevronDown, ImageIcon, Loader2, Download, X, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGE_BRIEF_MARKER, NEVA_MODELS, type NevaModel } from "@/lib/ai/models";

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

const suggestions = [
  "Ameliore mon prompt de poster",
  "Trouve un concept de lancement",
  "Cree une direction artistique",
  "Optimise une annonce Discord",
];

const modelList = Object.values(NEVA_MODELS);

const BADGE_COLORS: Record<string, string> = {
  PRO: "bg-[#FF7B4B]/20 text-[#FF7B4B] border-[#FF7B4B]/30",
  FAST: "bg-[#FFD166]/20 text-[#FFD166] border-[#FFD166]/30",
  STUDIO: "bg-[#FF7B4B]/20 text-[#FF7B4B] border-[#FF7B4B]/30",
  CORE: "bg-[#FFD166]/20 text-[#FFD166] border-[#FFD166]/30",
};

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

// ─── Inline markdown renderer ─────────────────────────────────────────────────

function formatInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="text-[#F5F0E8] font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**")) {
      return (
        <em key={i} className="text-[#CCCCC0] italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={i} className="bg-white/[0.07] text-[#FFD166] font-mono text-[11px] px-1.5 py-0.5 rounded mx-0.5">
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
    <div className="space-y-1.5">
      {lines.map((line, index) => {
        const h2 = line.match(/^## (.+)/);
        const h3 = line.match(/^### (.+)/);
        const numbered = line.match(/^(\d+)[.)]\s+(.+)/);
        const bullet = line.match(/^[-•*]\s+(.+)/);
        const hr = /^---+$/.test(line);
        const sectionHead = line.endsWith(":") && line.length < 62 && !line.startsWith("-") && !line.startsWith("*");

        if (h2) return (
          <div key={index} className="text-[#F5F0E8] font-semibold text-[13px] pt-2 mt-0.5 first:pt-0 border-t border-white/[0.05]">
            {formatInline(h2[1])}
          </div>
        );

        if (h3) return (
          <div key={index} className="text-[#CCCCC0] font-semibold text-[12px] pt-1 first:pt-0">
            {formatInline(h3[1])}
          </div>
        );

        if (hr) return <div key={index} className="border-t border-white/[0.06] my-1" />;

        if (sectionHead) return (
          <div key={index} className="text-[#F5F0E8] font-semibold text-[13px] pt-1.5 first:pt-0">
            {formatInline(line.slice(0, -1))}
          </div>
        );

        if (numbered) return (
          <div key={index} className="flex gap-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-[#FF7B4B]/15 text-[10px] font-bold text-[#FFD166]">
              {numbered[1]}
            </span>
            <span className="leading-relaxed">{formatInline(numbered[2])}</span>
          </div>
        );

        if (bullet) return (
          <div key={index} className="flex gap-2.5">
            <span className="mt-[9px] h-1 w-1 flex-shrink-0 rounded-full bg-[#FFD166]" />
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

// ─── Page component ───────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Dites-moi ce que vous voulez publier : bannière, logo, landing page ou identité serveur. Je vous réponds avec un angle clair, un format et un prompt prêt à lancer.",
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
        const res = await fetch("/api/chat/history");
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
      await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            ? { ...m, content: "Erreur réseau. Réessaie.", generatingImage: false }
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            content: "Tes créations disponibles sont épuisées. Recharge ton espace dans [Billing](/dashboard/billing) pour continuer.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      if (!res.ok || !res.body) {
        let errorMsg = "Désolé, une erreur s'est produite. Réessaie dans un instant.";
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
          content: "Désolé, une erreur s'est produite. Réessaie dans un instant.",
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
        content:
          "Dites-moi ce que vous voulez publier : bannière, logo, landing page ou identité serveur. Je vous réponds avec un angle clair, un format et un prompt prêt à lancer.",
        timestamp: new Date(),
      },
    ]);
    setStreamingContent("");
    setPendingAttachments([]);
  };

  return (
    <div
      className="mx-auto flex min-h-0 w-full max-w-[1180px] flex-1 flex-col"
      style={{ height: "100dvh" }}
      onClick={() => setModelPickerOpen(false)}
    >
      {/* Header */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#050505]/55 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/[0.10] bg-gradient-to-br from-[#FF6B7D] to-[#FFD166] text-[12px] font-bold text-white shadow-[0_14px_40px_rgba(255,123,75,0.16)]">
            N
          </div>
          <div>
            <div className="text-sm font-semibold text-[#F5F0E8]">Creative Director</div>
            <div className="text-[11px] text-[#777]">Strategy, prompts, branding, launch ideas</div>
          </div>
          <div className="ml-3 hidden items-center gap-1 rounded-full border border-[#55D18A]/20 bg-[#55D18A]/10 px-2 py-1 text-[10px] text-[#55D18A] sm:flex">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
            Online
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model picker */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setModelPickerOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111] border border-white/[0.10] text-sm text-[#CCCCC0] hover:border-[#FF7B4B]/40 hover:bg-[#FF7B4B]/5 transition-all"
            >
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  BADGE_COLORS[selectedModel.badge] ?? BADGE_COLORS.PRO
                }`}
              >
                {selectedModel.badge}
              </span>
              <span className="font-medium">{selectedModel.name}</span>
              <ChevronDown size={12} className="text-[#555]" />
            </button>

            {modelPickerOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
                {modelList.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m);
                      setModelPickerOpen(false);
                    }}
                    className={`w-full flex items-start gap-2.5 px-3.5 py-3 text-left hover:bg-white/[0.04] transition-colors ${
                      selectedModel.id === m.id ? "bg-white/[0.04]" : ""
                    }`}
                  >
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border mt-0.5 flex-shrink-0 ${
                        BADGE_COLORS[m.badge] ?? BADGE_COLORS.PRO
                      }`}
                    >
                      {m.badge}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-[#F5F0E8]">{m.name}</div>
                      <div className="text-[10px] text-[#555] mt-0.5">{m.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button variant="ghost" size="sm" className="gap-1.5" onClick={resetChat}>
            <Plus size={14} />
            New Chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "assistant" && (
              <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#FF6B7D] to-[#FFD166] text-[12px] font-bold text-white">
                N
              </div>
            )}
            <div
              className={`max-w-[82%] ${
                msg.role === "user" ? "items-end" : "items-start"
              } flex flex-col gap-1.5`}
            >
              {/* Attachments preview */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {msg.attachments.map((att, ai) => (
                    <div
                      key={ai}
                      className="w-20 h-20 rounded-xl overflow-hidden border border-white/[0.08] flex-shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={att.preview} alt="ref" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {msg.content && msg.content !== "📎" && (
                <div
                  className={`rounded-[16px] px-4 py-3 text-sm leading-relaxed shadow-[0_14px_38px_rgba(0,0,0,0.22)] ${
                    msg.role === "user"
                      ? "rounded-tr-md border border-[#FF7B4B]/22 bg-[#FF7B4B]/16 text-[#F5F0E8]"
                      : "rounded-tl-md border border-white/[0.07] bg-white/[0.045] text-[#D8D1C8]"
                  }`}
                >
                  <MessageContent content={msg.content} variant={msg.role} />
                </div>
              )}

              {/* Generated image */}
              {msg.image && (
                <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0a0a0a] max-w-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={msg.image} alt="Generated" className="w-full h-auto block" />
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#444]">Généré par Neva</span>
                    <button
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = msg.image!;
                        a.download = `neva-${Date.now()}.webp`;
                        a.click();
                      }}
                      className="flex items-center gap-1 text-[10px] text-[#FF7B4B] hover:text-[#FFD166] transition-colors"
                    >
                      <Download size={10} /> Télécharger
                    </button>
                  </div>
                </div>
              )}

              {msg.generatingImage && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-[#111] border border-[#FF7B4B]/20 rounded-xl text-xs text-[#666]">
                  <Loader2 size={11} className="animate-spin text-[#FF7B4B] flex-shrink-0" />
                  <span>
                    Génération de l&apos;image en cours…
                    <span className="text-[#444] ml-1">· inclus selon ton plan</span>
                  </span>
                </div>
              )}

              {msg.role === "assistant" &&
                msg.canGenerateImage &&
                !msg.image &&
                !msg.generatingImage &&
                i > 0 && (
                  <button
                    onClick={() => generateImageFromMessage(i, cleanAssistantText(msg.content))}
                    className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/[0.08] text-[#555] hover:text-[#FFD166] hover:border-[#FFD166]/30 transition-all"
                  >
                    <ImageIcon size={10} />
                    Regénérer l&apos;image
                  </button>
                )}

              <span className="text-[10px] text-[#444]">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B7D] to-[#FFD166] flex-shrink-0 flex items-center justify-center text-[12px] font-bold text-white">
              N
            </div>
            <div className="max-w-[75%] flex flex-col gap-1">
              <div className="px-4 py-3 bg-[#111] text-[#CCCCC0] border border-white/[0.06] rounded-2xl rounded-tl-sm text-sm leading-relaxed min-w-[120px]">
                {streamingContent ? (
                  <MessageContent content={streamingContent} variant="assistant" />
                ) : (
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((d) => (
                      <div
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && !isLoading && (
        <div className="mx-auto flex w-full max-w-4xl flex-wrap gap-2 px-4 pb-3 sm:px-6">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.045] px-3 py-2 text-xs text-[#A9A39B] transition-all hover:border-[#FF7B4B]/30 hover:bg-white/[0.07] hover:text-[#F5F0E8]"
            >
              <Sparkles size={10} className="text-[#FFD166]" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Pending attachments */}
      {pendingAttachments.length > 0 && (
        <div className="px-6 pb-2 flex items-center gap-2">
          {pendingAttachments.map((att, i) => (
            <div
              key={i}
              className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#FF7B4B]/30 flex-shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={att.preview} alt="attachment" className="w-full h-full object-cover" />
              <button
                onClick={() => setPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute top-0 right-0 w-4 h-4 bg-black/80 flex items-center justify-center rounded-bl"
              >
                <X size={8} className="text-white" />
              </button>
            </div>
          ))}
          <span className="text-[10px] text-[#555]">
            {pendingAttachments.length} image{pendingAttachments.length > 1 ? "s" : ""} de référence
          </span>
        </div>
      )}

      {/* Input */}
      <div className="mx-auto w-full max-w-4xl flex-shrink-0 px-4 pb-6 sm:px-6">
        <div className="flex gap-2 rounded-[16px] border border-white/[0.09] bg-white/[0.055] px-4 py-3 shadow-[0_22px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-colors focus-within:border-[#FF7B4B]/40">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={pendingAttachments.length >= 4}
            className="flex-shrink-0 text-[#444] hover:text-[#FF7B4B] transition-colors disabled:opacity-30 pt-0.5"
            title="Ajouter une image de référence"
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
          <div className="flex items-center pt-0.5 flex-shrink-0">
            <MessageSquare size={14} className="text-[#333]" />
          </div>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              pendingAttachments.length > 0
                ? "Decris l objectif creatif avec ces references..."
                : "Demandez une direction artistique, un prompt ou une idee de campagne..."
            }
            rows={1}
            className="flex-1 bg-transparent text-sm text-[#F5F0E8] placeholder-[#444] outline-none resize-none leading-relaxed"
            style={{ minHeight: "24px", maxHeight: "120px" }}
          />
          {(pendingAttachments.length > 0 || hasImageIntent(input)) && (
            <button
              onClick={() => handleGenerateImage()}
              disabled={
                (!input.trim() && pendingAttachments.length === 0) || isLoading || isGeneratingImage
              }
              className="flex-shrink-0 w-10 h-8 rounded-xl bg-white/5 border border-white/[0.08] text-[#CCCCC0] hover:text-[#FFD166] disabled:opacity-30 transition-all self-end"
              title="Générer un visuel"
            >
              <ImageIcon size={14} />
            </button>
          )}
          <button
            onClick={() => handleSend()}
            disabled={(!input.trim() && pendingAttachments.length === 0) || isLoading}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B7D] to-[#FFD166] flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-opacity self-end"
          >
            <Send size={13} className="text-white" />
          </button>
        </div>
        <p className="text-[10px] text-[#333] text-center mt-2">
          {selectedModel.name} · Neva AI · références acceptées · Enter pour envoyer
        </p>
      </div>
    </div>
  );
}
