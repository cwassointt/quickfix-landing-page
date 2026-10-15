import { Plus } from "lucide-react";
import { faq } from "@/data/faq";
import { waLink } from "@/lib/site";

/** Preguntas frecuentes con <details> nativo: accesible y funciona sin JavaScript. */
const FaqSection = ({ items = faq }: { items?: typeof faq }) => (
  <section id="faq" className="bg-[#0b0b0b] py-24 md:py-36">
    <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <h2 className="text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">Preguntas frecuentes</h2>
        <p className="mt-6 max-w-[40ch] text-lg text-white/80">
          ¿Tu duda no está aquí?{" "}
          <a href={waLink("Hola QuickFix, tengo una consulta.")} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:decoration-2">
            Pregúntame por WhatsApp
          </a>
          .
        </p>
      </div>

      <div className="space-y-2">
        {items.map((f) => (
          <details key={f.q} className="group rounded-3xl bg-white/[0.04] open:bg-white/[0.07] transition-colors duration-200">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-3xl px-6 py-5 text-lg text-white hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
              {f.q}
              <Plus className="h-5 w-5 shrink-0 text-primary transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none" aria-hidden="true" />
            </summary>
            <div className="space-y-3 px-6 pb-6 text-white/80">
              {f.a.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default FaqSection;
