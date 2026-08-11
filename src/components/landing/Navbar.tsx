"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslations } from "@/components/LanguageProvider";

export default function Navbar() {
  const { t } = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { href: "#features", label: t("common.features") },
    { href: "/neva-design#portfolio", label: "Portfolio" },
    { href: "#pricing", label: t("common.pricing") },
    { href: "#resources", label: "Ressources" },
    { href: "#showcase", label: t("common.showcase") },
    { href: "#faq", label: t("common.faq") },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#080808]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/nevalogooo.png"
                alt="Neva AI"
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">
              <span className="text-neva-gradient">Neva</span>
              <span className="text-[#F5F0E8]/80"> AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm text-[#9A9A9A] hover:text-[#F5F0E8] transition-colors duration-200 rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSelector />
            <Link href="/login">
              <Button variant="ghost" size="sm">{t("common.login")}</Button>
            </Link>
            <Link href="/signup">
              <Button variant="gradient" size="sm">{t("common.getStarted")}</Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-[#9A9A9A] hover:text-[#F5F0E8] rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 text-sm text-[#9A9A9A] hover:text-[#F5F0E8] hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3 border-t border-white/[0.06] mt-2">
              <Link href="/login" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">{t("common.login")}</Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button variant="gradient" size="sm" className="w-full">{t("common.getStarted")}</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
