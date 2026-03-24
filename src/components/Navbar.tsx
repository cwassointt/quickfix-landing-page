import React, { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import FAQDialog from "@/components/FAQDialog";
import WarrantyDialog from "@/components/WarrantyDialog";
import TermsDialog from "@/components/TermsDialog";

// ── GLOBAL STYLES: CONTAINER SCROLLING FIX (FINAL BOSS SOLUTION) ──
const _globalCss = `
  html {
    scroll-behavior: smooth !important;
    scroll-padding-top: 90px;
  }

  /* Reset total para evitar el "Scroll Falso" */
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow-x: hidden !important;
  }

  /* FORZAR al contenedor principal a ceder el control al Window */
  body, #root, #__next, main, .App {
    height: auto !important;
    min-height: 100vh !important;
    overflow-y: visible !important; /* Clave: el body NO debe tener scroll interno */
    overflow-x: hidden !important;
    position: relative !important;
    display: block !important;
  }
`;

if (typeof document !== "undefined" && !document.getElementById("global-scroll-css")) {
  const el = document.createElement("style");
  el.id = "global-scroll-css";
  el.textContent = _globalCss;
  document.head.appendChild(el);
}

// Static data outside component — never re-created
const links = [
  { label: "Servicios", href: "#servicios" },
  { label: "Proceso",   href: "#proceso"   },
  { label: "Contacto",  href: "#contacto"  },
];

const WA_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-current relative z-10" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen]   = useState(false);
  const [warrantyOpen, setWarrantyOpen] = useState(false);
  const [termsOpen, setTermsOpen]       = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu  = useCallback(() => setMenuOpen(false), []);
  const openFaq    = useCallback(() => setFaqOpen(true),   []);
  const closeFaq   = useCallback(() => setFaqOpen(false),  []);
  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);

  const openFaqFromMenu = useCallback(() => {
    closeMenu();
    openFaq();
  }, [closeMenu, openFaq]);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace(/.*#/, "");
    const elem = document.getElementById(targetId);

    if (elem) {
      // El CSS 'scroll-padding-top: 90px' en el html se encarga del offset automáticamente
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          scrolled ? "bg-[#050505]/90 backdrop-blur-xl shadow-2xl border-b border-white/5 py-0" : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-8 flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#"
            className="group relative flex items-center gap-1 font-black text-5xl tracking-tighter flex-shrink-0 transition-transform duration-300 hover:scale-[1.02]"
            style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
          >
            {/* Intense glow effect behind logo */}
            <div className="absolute -inset-6 bg-orange-500/25 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

            <span className="relative z-10 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              Quick
            </span>
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-orange-600 drop-shadow-[0_0_20px_rgba(249,115,22,0.8)]">
              Fix
            </span>
          </a>

          {/* Desktop nav — centered absolutely */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => handleScroll(e, l.href)}
                className="relative group text-sm font-bold text-white/80 hover:text-white transition-colors duration-300 tracking-widest uppercase cursor-pointer"
                style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
              >
                {l.label}
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100 ease-out" />
              </a>
            ))}
            {/* FAQ Button Desktop */}
            <button
              onClick={openFaq}
              className="relative group text-sm font-bold text-white/80 hover:text-white transition-colors duration-300 tracking-widest uppercase flex items-center gap-2"
              style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
            >
              FAQ
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100 ease-out" />
            </button>

            {/* Secondary Links: Terms & Warranty */}
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-6">
                <button
                    onClick={() => setTermsOpen(true)}
                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                    Términos
                </button>
                <button
                    onClick={() => setWarrantyOpen(true)}
                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                    Garantía
                </button>
            </div>
          </div>

          {/* Desktop CTA pill */}
          <div className="hidden lg:block flex-shrink-0">
            <a
              href="https://wa.me/51940755119"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden text-white px-7 py-3 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 hover:brightness-110 flex items-center gap-2"
              style={{ fontFamily: "var(--font-visual-sans, sans-serif)", backgroundColor: "#25D366" }}
            >
              {WA_ICON}
              <span className="relative z-10">WhatsApp</span>
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={toggleMenu} className="lg:hidden text-white" aria-label="Menu">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-black/95 border-b border-white/10 px-8 py-5 space-y-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => handleScroll(e, l.href)}
                className="block w-full text-left text-white text-base font-medium py-2 hover:text-orange-400 transition-colors"
                style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={openFaqFromMenu}
              className="block w-full text-left text-white text-base font-medium py-2 hover:text-orange-400 transition-colors"
              style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
            >
              Preguntas Frecuentes
            </button>

            <div className="flex gap-6 py-2 border-t border-white/10 mt-2">
                <button
                    onClick={() => { closeMenu(); setTermsOpen(true); }}
                    className="text-sm text-gray-400 hover:text-white"
                >
                    Términos
                </button>
                <button
                    onClick={() => { closeMenu(); setWarrantyOpen(true); }}
                    className="text-sm text-gray-400 hover:text-white"
                >
                    Garantía
                </button>
            </div>

            <a
              href="https://wa.me/51940755119"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-white px-5 py-3 rounded-full text-center text-base font-semibold mt-2"
              style={{ backgroundColor: "#25D366" }}
            >
              {WA_ICON}
              WhatsApp
            </a>
          </div>
        )}
      </nav>

      <FAQDialog open={faqOpen} onClose={closeFaq} />
      <WarrantyDialog open={warrantyOpen} onClose={() => setWarrantyOpen(false)} />
      <TermsDialog open={termsOpen} onClose={() => setTermsOpen(false)} />
    </>
  );
};

export default Navbar;
