import { servicePages } from "@/data/pages";
import { ADDRESS, EMAIL, INSTAGRAM_URL, PHONE_DISPLAY, TIKTOK_URL, scrollToId, waLink } from "@/lib/site";

const sections = [
  { label: "Reseñas", id: "resenas" },
  { label: "Servicios y precios", id: "servicios" },
  { label: "Cotizador", id: "cotizar" },
  { label: "Proceso", id: "proceso" },
  { label: "Preguntas", id: "faq" },
  { label: "Contacto", id: "contacto" },
];

const LINK = "rounded-sm text-black underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black";

/** Cierre de la página: campo naranja de marca y el nombre a todo lo ancho. */
const Footer = () => {
  return (
    <footer className="bg-primary text-black">
      <div className="mx-auto max-w-7xl px-5 pt-16 md:px-8 md:pt-24">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="max-w-[24ch] text-2xl font-medium leading-snug md:text-3xl">Mantenimiento y reparación de alta gama, 24/7 con cita.</p>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex rounded-full bg-black px-7 py-3.5 text-lg text-white transition-transform duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
              Escribir por WhatsApp
            </a>
          </div>
          <nav aria-label="Servicios">
            <ul className="space-y-2 text-lg">
              {servicePages.map((p) => (
                <li key={p.slug}>
                  <a href={`/${p.slug}/`} className={LINK}>
                    {p.h1.replace(" en Lima", "")}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Secciones">
            <ul className="space-y-2 text-lg">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} onClick={(e) => { e.preventDefault(); scrollToId(s.id); }} className={LINK}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-2 text-lg">
            <p>{ADDRESS}</p>
            <p><a href={waLink()} target="_blank" rel="noopener noreferrer" className={LINK}>{PHONE_DISPLAY}</a></p>
            <p><a href={`mailto:${EMAIL}`} className={LINK}>{EMAIL}</a></p>
            <p className="flex gap-4">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={LINK}>Instagram</a>
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className={LINK}>TikTok</a>
            </p>
            <p className="flex gap-4 pt-2">
              <a href="/componentes/" className={LINK}>Componentes</a>
              <a href="/garantia/" className={LINK}>Garantía</a>
              <a href="/terminos/" className={LINK}>Términos</a>
            </p>
          </div>
        </div>

        <p className="font-display mt-16 select-none text-[22vw] font-bold leading-[0.8] tracking-[-0.06em] md:mt-24 lg:text-[17.5rem]" aria-hidden="true" translate="no">
          QuickFix
        </p>
        <p className="py-6 text-sm text-black/70">© {new Date().getFullYear()} QuickFix · San Miguel, Lima</p>
      </div>

    </footer>
  );
};

export default Footer;
