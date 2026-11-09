import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { preguntas, resumirFalla, type Respuestas } from "@/lib/recepcion";

const PRESS = "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]";

export type Resultado = ReturnType<typeof resumirFalla>;

/** Diálogo "No sé qué tiene": una pregunta por tarjeta y, al final, un resumen que va al campo de la falla. */
const AsistenteFalla = ({ tipo, onCerrar, onUsar }: { tipo: string; onCerrar: () => void; onUsar: (r: Resultado) => void }) => {
  const [resp, setResp] = useState<Respuestas>({});
  const [paso, setPaso] = useState(0);
  const caja = useRef<HTMLDivElement>(null);
  const lista = preguntas(tipo).filter((p) => !p.si || p.si(resp));
  const p = lista[paso];
  const final = paso >= lista.length;
  const resultado = resumirFalla(resp);

  // Esc cierra, el fondo no se desplaza y el foco entra al diálogo.
  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = antes; window.removeEventListener("keydown", esc); };
  }, [onCerrar]);
  useEffect(() => { caja.current?.querySelector<HTMLElement>("button[data-opcion], button[data-usar]")?.focus(); }, [paso]);

  const elegir = (o: string) => {
    if (p.multi) {
      const actual = resp[p.id] ?? [];
      setResp({ ...resp, [p.id]: actual.includes(o) ? actual.filter((x) => x !== o) : [...actual, o] });
      return;
    }
    setResp({ ...resp, [p.id]: [o] });
    setPaso(paso + 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onCerrar}>
      <div ref={caja} role="dialog" aria-modal="true" aria-labelledby="asistente-titulo" onClick={(e) => e.stopPropagation()}
        className="max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#111] p-6 sm:rounded-3xl md:p-8">
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => setPaso(Math.max(0, paso - 1))} disabled={paso === 0} aria-label="Pregunta anterior"
            className={`${PRESS} rounded-full p-2 text-white/70 hover:bg-white/[0.08] disabled:invisible`}>
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          {/* Progreso: un segmento por pregunta. */}
          <div className="flex flex-1 gap-1.5" aria-hidden="true">
            {lista.map((q, i) => <span key={q.id} className={`h-1 flex-1 rounded-full ${i < paso || final ? "bg-primary" : "bg-white/15"}`} />)}
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className={`${PRESS} rounded-full p-2 text-white/70 hover:bg-white/[0.08]`}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {!final ? (
          <div key={p.id} className="animate-in fade-in slide-in-from-right-4 duration-200">
            <p className="mt-6 text-sm text-white/50">Pregunta {paso + 1} de {lista.length}{p.multi ? " · elige todas las que apliquen" : ""}</p>
            <h2 id="asistente-titulo" className="mt-2 text-2xl font-bold tracking-[-0.02em] text-white">{p.titulo}</h2>
            <div className="mt-6 grid gap-2">
              {p.opciones.map((o) => {
                const on = resp[p.id]?.includes(o);
                return (
                  <button key={o} type="button" data-opcion onClick={() => elegir(o)} aria-pressed={on}
                    className={`${PRESS} flex items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left text-base ${on ? "bg-primary text-black" : "bg-white/[0.06] text-white hover:bg-white/[0.12]"}`}>
                    {o}
                    {on && <Check className="h-5 w-5 shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            {p.multi && (
              <button type="button" onClick={() => setPaso(paso + 1)}
                className={`${PRESS} mt-6 w-full rounded-full bg-white px-6 py-4 text-base font-medium text-black hover:bg-white/90`}>
                {resp[p.id]?.length ? "Siguiente" : "Ninguna, siguiente"}
              </button>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in duration-200">
            <h2 id="asistente-titulo" className="mt-6 text-2xl font-bold tracking-[-0.02em] text-white">Esto es lo que entendí</h2>
            <p className="mt-4 rounded-2xl bg-white/[0.06] p-5 text-base leading-relaxed text-white/90">{resultado.texto || "No marcaste ninguna respuesta."}</p>
            <p className="mt-4 text-base text-white/70">
              Parece un caso de <span className="font-medium text-primary">{resultado.servicio.toLowerCase()}</span>. Lo confirmo al revisar tu equipo.
            </p>
            <button type="button" data-usar onClick={() => onUsar(resultado)} disabled={!resultado.texto}
              className={`${PRESS} mt-6 w-full rounded-full bg-primary px-6 py-4 text-lg font-medium text-black hover:bg-[#ff7a1f] disabled:opacity-50`}>
              Usar este resumen
            </button>
            <p className="mt-3 text-center text-sm text-white/50">Puedes agregar más detalles después.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsistenteFalla;
