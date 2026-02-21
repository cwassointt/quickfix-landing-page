import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <a href="#" className="font-heading font-bold text-xl tracking-tight">
          <span className={scrolled ? "text-foreground" : "text-surface-dark-foreground"}>Quick</span>
          <span className="text-primary">Fix</span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                scrolled ? "text-muted-foreground" : "text-surface-dark-foreground/70"
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://wa.me/51940755119"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-heading font-semibold hover:brightness-110 transition"
          >
            WhatsApp
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden ${scrolled ? "text-foreground" : "text-surface-dark-foreground"}`}
          aria-label="Menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 py-4 space-y-3 animate-fade-in">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block text-foreground font-medium py-2 hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://wa.me/51940755119"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-primary text-primary-foreground px-5 py-3 rounded-lg text-center font-heading font-semibold"
          >
            WhatsApp
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
