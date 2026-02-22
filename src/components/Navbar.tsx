import { useState, useEffect } from "react";
import { Menu, X, HelpCircle } from "lucide-react";
import FAQDialog from "@/components/FAQDialog";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Servicios", href: "#servicios" },
    { label: "Proceso", href: "#proceso" },
    { label: "Contacto", href: "#contacto" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          scrolled
            ? "bg-[#050505]/90 backdrop-blur-xl shadow-2xl border-b border-white/5 py-0"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-8 flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#"
            className="group relative flex items-center gap-1 font-black text-5xl tracking-tighter flex-shrink-0 transition-transform duration-300 hover:scale-[1.02]"
            style={{ fontFamily: "'Inter', sans-serif" }}
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
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-12">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative group text-sm font-bold text-white/80 hover:text-white transition-colors duration-300 tracking-widest uppercase"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {l.label}
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100 ease-out" />
              </a>
            ))}
            {/* FAQ Button Desktop */}
            <button
                onClick={() => setFaqOpen(true)}
                className="relative group text-sm font-bold text-white/80 hover:text-white transition-colors duration-300 tracking-widest uppercase flex items-center gap-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                FAQ
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100 ease-out" />
            </button>
          </div>

          {/* Desktop CTA pill */}
          <div className="hidden md:block flex-shrink-0">
            <a
              href="https://wa.me/51940755119"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-white text-black px-7 py-3 rounded-full text-sm font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <span className="relative z-10 group-hover:text-orange-600 transition-colors duration-300">WhatsApp</span>
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-black/95 border-b border-white/10 px-8 py-5 space-y-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block text-white text-base font-medium py-2 hover:text-orange-400 transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {l.label}
              </a>
            ))}
            <button
                onClick={() => {
                    setMenuOpen(false);
                    setFaqOpen(true);
                }}
                className="block w-full text-left text-white text-base font-medium py-2 hover:text-orange-400 transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                PREGUNTAS FRECUENTES
            </button>
            <a
              href="https://wa.me/51940755119"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-orange-500 text-white px-5 py-3 rounded-full text-center text-base font-semibold mt-2"
            >
              WhatsApp
            </a>
          </div>
        )}
      </nav>

      <FAQDialog open={faqOpen} onClose={() => setFaqOpen(false)} />
    </>
  );
};

export default Navbar;
