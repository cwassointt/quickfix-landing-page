import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { openQuote, scrollToId, waLink } from "@/lib/site";

const links = [
  { label: "Reseñas", id: "resenas" },
  { label: "Servicios", id: "servicios" },
  { label: "Componentes", id: "componentes", href: "/componentes/" },
  { label: "Cotizar", id: "cotizar" },
  { label: "Proceso", id: "proceso" },
  { label: "Preguntas", id: "faq" },
  { label: "Contacto", id: "contacto" },
];

const WA_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const PRESS = "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Marca en el menú la sección que se está leyendo.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    links.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Menú móvil: Escape cierra y el fondo no se desplaza mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    if (id === "cotizar") openQuote();
    else scrollToId(id);
  };

  return (
    <header data-lugar="navbar" className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || open ? "bg-[#050505]" : "bg-transparent"}`}>
      <a href="#cotizar" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-black">
        Saltar al cotizador
      </a>
      <nav aria-label="Principal" className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <a href="#" onClick={(e) => { e.preventDefault(); setOpen(false); window.scrollTo({ top: 0 }); }} className={`${PRESS} font-display text-[28px] font-bold tracking-[-0.04em] leading-none rounded-md`} translate="no">
          <span className="text-white">Quick</span>
          <span className="text-primary">Fix</span>
        </a>

        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={l.href ?? `#${l.id}`}
                onClick={l.href ? undefined : (e) => go(e, l.id)}
                aria-current={active === l.id ? "true" : undefined}
                className={`${PRESS} block rounded-full px-3 py-2 text-sm xl:px-4 xl:text-base ${active === l.id ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/[0.06]"}`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribir por WhatsApp"
            className={`${PRESS} hidden sm:grid place-items-center w-11 h-11 rounded-full bg-white/[0.07] text-white hover:bg-white/[0.14]`}
          >
            {WA_ICON}
          </a>
          <a href="#cotizar" onClick={(e) => go(e, "cotizar")} className={`${PRESS} rounded-full bg-primary px-5 py-2.5 text-base font-medium text-black hover:bg-[#ff7a1f]`}>
            Cotizar
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className={`${PRESS} lg:hidden grid place-items-center w-11 h-11 rounded-full text-white hover:bg-white/[0.08]`}
          >
            {open ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="menu-movil" className="lg:hidden fixed inset-x-0 top-[72px] bottom-0 overflow-y-auto overscroll-contain bg-[#050505] px-5 pb-10 pt-4 animate-in fade-in duration-200">
          <ul>
            {links.map((l) => (
              <li key={l.id}>
                <a href={l.href ?? `#${l.id}`} onClick={l.href ? undefined : (e) => go(e, l.id)} className="font-display block py-3 text-4xl font-bold tracking-[-0.03em] text-white active:text-primary">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={`${PRESS} mt-8 flex items-center justify-center gap-3 rounded-full bg-primary py-4 text-lg font-medium text-black`}
          >
            {WA_ICON}
            Escribir por WhatsApp
          </a>
          <p className="mt-4 text-center text-white/60">Atención 24/7 con cita · San Miguel, Lima</p>
        </div>
      )}
    </header>
  );
};

export default Navbar;
