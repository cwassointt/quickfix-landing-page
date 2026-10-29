import { Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BackButton from "@/components/BackButton";
import type { LegalDoc } from "@/data/legal";
import { waLink } from "@/lib/site";

/** Garantía y Términos como páginas propias: se pueden enlazar, Google las indexa y se leen cómodas en el móvil. */
const LegalPage = ({ doc }: { doc: LegalDoc }) => (
  <div className="relative min-h-[100svh] w-full overflow-x-clip bg-[#050505]">
    <Navbar />
    <main className="mx-auto max-w-3xl px-5 pb-28 pt-[120px] md:px-8 md:pt-[150px]">
      <BackButton fallback="/#contacto" />
      <nav aria-label="Ruta" className="mt-8 text-white/60">
        <a href="/" className="hover:text-white">Inicio</a> <span aria-hidden="true">/</span> <span className="text-white/80">{doc.title}</span>
      </nav>
      <h1 className="mt-6 section-title">{doc.title}</h1>
      <p className="section-lead">{doc.intro}</p>

      <div className="section-body space-y-4">
        {doc.sections.map((s) => (
          <section key={s.title} className="rounded-3xl bg-white/[0.04] p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">{s.title}</h2>
            {s.paragraphs.map((p) => (
              <p key={p} className="mt-4 text-lg leading-relaxed text-white/80">{p}</p>
            ))}
            {(s.covers || s.excludes) && (
              <ul className="mt-5 space-y-2">
                {s.covers?.map((c) => (
                  <li key={c} className="flex gap-3 text-white">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span><span className="sr-only">Cubre: </span>{c}</span>
                  </li>
                ))}
                {s.excludes?.map((c) => (
                  <li key={c} className="flex gap-3 text-white/80">
                    <X className="mt-1 h-5 w-5 shrink-0 text-white/50" aria-hidden="true" />
                    <span><span className="sr-only">No cubre: </span>{c}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="mt-10 text-lg text-white/70">{doc.closing}</p>
      <a
        href={waLink(`Hola QuickFix, tengo una consulta sobre: ${doc.title.toLowerCase()}.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex rounded-full bg-primary px-8 py-4 text-lg font-medium text-black transition-transform duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
      >
        Preguntar por WhatsApp
      </a>
    </main>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default LegalPage;
