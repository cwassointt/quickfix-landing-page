import { useEffect, useState } from "react";
import { Loader2, MapPin, MessageCircle } from "lucide-react";
import { Progreso } from "@/components/Progreso";
import { COLOR_ESTADO, api, estadoDe, fecha, progreso, type Paso } from "@/lib/recepcion";
import { MAPS_URL, waLink } from "@/lib/site";

type Caso = { numero: string; nombre: string; tipo: string; marca: string; modelo: string; estado: string; creado: string; recibido: string | null; historial: Paso[] };

/** Lo que significa cada estado para el cliente, en sus palabras. */
const PARA_CLIENTE: Record<string, { titulo: string; texto: string }> = {
  registrado: { titulo: "Te estamos esperando", texto: "Ya tenemos tus datos. Cuando dejes el equipo en el taller, empezamos." },
  recibido: { titulo: "Recibimos tu equipo", texto: "Está en cola para la revisión. Te avisamos por WhatsApp apenas tengamos el diagnóstico." },
  diagnostico: { titulo: "Estamos revisándolo", texto: "El técnico está haciendo el diagnóstico. Si hace falta tu aprobación para algún gasto, te escribimos antes." },
  reparado: { titulo: "¡Está listo!", texto: "Tu equipo quedó reparado y probado. Puedes recogerlo en el taller." },
  no_reparado: { titulo: "Diagnóstico terminado", texto: "La placa no tiene reparación. Te escribimos por WhatsApp con la opción de reemplazo; también puedes recoger tu equipo." },
  entregado: { titulo: "Equipo entregado", texto: "Gracias por confiar en QuickFix. Si tienes cualquier duda, escríbenos." },
  devuelto: { titulo: "Equipo entregado", texto: "Gracias por confiar en QuickFix. Si quieres retomar el reemplazo de la placa, escríbenos." },
};
const NOMBRE_PASO: Record<string, string> = {
  registrado: "Registro", recibido: "Recibido en el taller", diagnostico: "En diagnóstico", reparado: "Reparado",
  no_reparado: "No reparable", entregado: "Entregado", devuelto: "Entregado",
};

/** Página pública que abre el cliente con su enlace: ve cómo va su equipo sin tener que escribir. */
const SeguimientoPage = () => {
  const [caso, setCaso] = useState<Caso | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // El enlace llega como ?t=… (se lee aquí porque la página se pregenera sin la URL).
    const t = new URLSearchParams(window.location.search).get("t") ?? "";
    api<{ caso: Caso }>("seguimiento", undefined, `&t=${encodeURIComponent(t)}`).then((r) => setCaso(r.caso)).catch((e) => setError(e.message));
  }, []);

  const e = caso ? estadoDe(caso.estado) : "";
  const info = PARA_CLIENTE[e] ?? PARA_CLIENTE.recibido;
  const terminado = caso ? progreso(caso.estado).etapa >= 3 : false;

  return (
    <main className="min-h-[100svh] bg-[#050505] px-5 pb-16 pt-8 md:pt-12">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="text-2xl font-bold text-white transition-opacity hover:opacity-80">QUICK<span className="text-primary">FIX</span></a>

        {!caso && !error && <Loader2 className="mx-auto mt-24 h-8 w-8 animate-spin text-white/50" aria-label="Cargando" />}
        {error && (
          <div className="mt-12 rounded-3xl bg-white/[0.035] p-8 text-center ring-1 ring-white/[0.07]">
            <p className="text-lg text-white">{error}</p>
            <a href={waLink("Hola QuickFix, quiero saber cómo va mi equipo.")} target="_blank" rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-black transition hover:bg-[#ff7a1f]">
              <MessageCircle className="h-5 w-5" aria-hidden="true" /> Escríbenos por WhatsApp
            </a>
          </div>
        )}

        {caso && (
          <>
            <p className="mt-10 text-base text-white/60">Hola {caso.nombre}, así va tu equipo</p>
            <h1 className="mt-1 font-display text-4xl font-bold tracking-[-0.035em] text-white md:text-5xl">{info.titulo}</h1>

            <section className="relative mt-8 overflow-hidden rounded-3xl bg-white/[0.035] p-6 ring-1 ring-white/[0.07] md:p-8">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ background: COLOR_ESTADO[e] }} />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-2xl font-bold text-primary">{caso.numero}</p>
                <p className="text-sm text-white/55">{[caso.tipo, caso.marca, caso.modelo].filter(Boolean).join(" · ")}</p>
              </div>
              <Progreso estado={caso.estado} />
              <p className="mt-6 text-base leading-relaxed text-white/80">{info.texto}</p>
            </section>

            {caso.historial.length > 0 && (
              <section className="mt-4 rounded-3xl bg-white/[0.035] p-6 ring-1 ring-white/[0.07] md:p-8">
                <h2 className="font-display text-lg font-bold text-white">Paso a paso</h2>
                <ol className="mt-4">
                  {caso.historial.map((p, i) => (
                    <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                      {i < caso.historial.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-4 w-px bg-white/10" />}
                      <span aria-hidden="true" className="mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full" style={{ background: COLOR_ESTADO[estadoDe(p.estado)] }} />
                      <div>
                        <p className="text-sm font-medium text-white">{NOMBRE_PASO[estadoDe(p.estado)] ?? p.estado}</p>
                        <p className="text-xs text-white/50">{fecha(p.fecha)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a href={waLink(`Hola QuickFix, quiero saber cómo va mi equipo ${caso.numero}.`)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-medium text-black transition hover:bg-[#ff7a1f] active:scale-[0.98]">
                <MessageCircle className="h-5 w-5" aria-hidden="true" /> Escribir por WhatsApp
              </a>
              {terminado && (
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.07] px-6 py-4 text-base text-white transition hover:bg-white/[0.13] active:scale-[0.98]">
                  <MapPin className="h-5 w-5" aria-hidden="true" /> Talambo 135, San Miguel
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default SeguimientoPage;
