import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Showcase", href: "#showcase" },
    { label: "Changelog", href: "/changelog" },
  ],
  Company: [
    { label: "About Neva Design", href: "https://neva-ia.com" },
    { label: "Blog", href: "/blog" },
    { label: "Discord", href: "https://discord.gg/neva-design" },
    { label: "Contact", href: "nevapro@nevadesign.fr" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image src="/nevalogooo.png" alt="Neva AI" fill sizes="32px" className="object-contain" />
              </div>
              <span className="font-semibold text-[15px]">
                <span className="text-neva-gradient">Neva</span>
                <span className="text-[#F5F0E8]/80"> AI</span>
              </span>
            </Link>
            <p className="text-sm text-[#666] leading-relaxed max-w-xs mb-5">
              The creative AI built for FiveM server creators, designers, and GTA RP entrepreneurs.
            </p>
            <p className="text-xs text-[#444]">
              Powered by{" "}
              <a href="https://nevadesign.fr" className="text-[#FF7B4B] hover:text-[#FFD166] transition-colors" target="_blank" rel="noopener noreferrer">
                Neva Design
              </a>
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-[#9A9A9A] uppercase tracking-widest mb-4">
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#666] hover:text-[#F5F0E8] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#444]">
            © {new Date().getFullYear()} Neva AI — A product by Neva Design. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://discord.gg/nevadesign"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#444] hover:text-[#FF7B4B] transition-colors"
              aria-label="Discord"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.13 18.114a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
            </a>
            <a
              href="https://twitter.com/nevadesign"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#444] hover:text-[#FF7B4B] transition-colors"
              aria-label="Twitter / X"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
