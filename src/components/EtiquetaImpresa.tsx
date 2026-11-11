import { useEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Printer, Wrench, X } from "lucide-react";
import qrcode from "qrcode-generator";
import { etiquetas, type Etiqueta, type Orden } from "@/lib/recepcion";

const PRESS = "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]";

// Rollo de 50 × 30 mm: en la impresora de etiquetas cada etiqueta sale como una "página".
// Fuera de la impresión, la copia para imprimir no se ve (la vista previa es otra copia escalada).
const CSS_IMPRESION = `
@media screen { .qf-imprimir { display: none; } }
@media print {
  @page { size: 50mm 30mm; margin: 0; }
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  body > *:not(.qf-imprimir) { display: none !important; }
  .qf-imprimir { display: block; }
  .qf-etiqueta { break-after: page; }
  .qf-etiqueta:last-child { break-after: auto; }
}
.qf-etiqueta, .qf-etiqueta * { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: Arial, Helvetica, sans-serif !important; }
.qf-etiqueta .qf-mono { font-family: "Courier New", Courier, monospace !important; }
`;

/** QR en SVG con un módulo de margen blanco; nítido a cualquier tamaño. */
function Qr({ texto, mm }: { texto: string; mm: number }) {
  const qr = qrcode(0, "M");
  qr.addData(texto);
  qr.make();
  const n = qr.getModuleCount();
  let d = "";
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x + 1} ${y + 1}h1v1h-1z`;
  return (
    <svg viewBox={`0 0 ${n + 2} ${n + 2}`} width={`${mm}mm`} height={`${mm}mm`} shapeRendering="crispEdges" role="img" aria-label="Código QR del caso" style={{ display: "block", flexShrink: 0 }}>
      <rect width={n + 2} height={n + 2} fill="#fff" />
      <path d={d} fill="#000" />
    </svg>
  );
}

const unaLinea: CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

/** Una etiqueta de 50 × 30 mm, en negro sobre blanco para impresora térmica. Medidas en mm reales. */
export function EtiquetaQF({ e }: { e: Etiqueta }) {
  const cargador = e.PARTE === "CARGADOR";
  return (
    <div className="qf-etiqueta" style={{
      width: "50mm", height: "30mm", boxSizing: "border-box", padding: "1.2mm 1.5mm 1mm", background: "#fff", color: "#000",
      display: "flex", flexDirection: "column", gap: "0.6mm", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1mm" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.7mm", background: "#000", color: "#fff", borderRadius: "0.6mm", padding: "0.4mm 1mm 0.4mm 0.8mm", fontSize: "1.9mm", lineHeight: 1.1 }}>
          <Wrench aria-hidden="true" style={{ width: "1.9mm", height: "1.9mm" }} strokeWidth={2.6} />
          <span>Quick<b>Fix</b>.pe</span>
        </span>
        {cargador ? (
          <span style={{ fontSize: "1.6mm", fontWeight: 700, letterSpacing: "0.1mm", border: "0.2mm solid #000", borderRadius: "0.4mm", padding: "0.2mm 0.8mm" }}>CARGADOR</span>
        ) : (
          <span style={{ textAlign: "right", lineHeight: 1.1 }}>
            <span style={{ display: "block", fontSize: "1.6mm", fontWeight: 700 }}>{e.SERVICIO}</span>
            <span style={{ display: "block", fontSize: "1.6mm" }}>{e.FECHA}</span>
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: "1.2mm", flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.3mm" }}>
          <div style={{ fontSize: "4.6mm", fontWeight: 700, letterSpacing: "-0.15mm", lineHeight: 1 }}>{e.QF}</div>
          <div style={{ height: "0.3mm", background: "#000", margin: "0.4mm 0 0.3mm" }} />
          <div style={{ fontSize: "2.2mm", fontWeight: 700, lineHeight: 1.15, ...unaLinea }}>{e.CLIENTE}</div>
          {e.WHATSAPP && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6mm", fontSize: "2.2mm", fontWeight: 700, lineHeight: 1.15 }}>
              <MessageCircle aria-label="WhatsApp" style={{ width: "2mm", height: "2mm", flexShrink: 0 }} strokeWidth={2.6} />
              <span>{e.WHATSAPP}</span>
            </div>
          )}
          {cargador ? (
            <div style={{ fontSize: "1.7mm", lineHeight: 1.2, marginTop: "0.3mm" }}>{e.FALLA}</div>
          ) : (
            <>
              <div style={{ fontSize: "1.8mm", lineHeight: 1.2, marginTop: "0.2mm", ...unaLinea }}>{e.EQUIPO}</div>
              <div className="qf-mono" style={{ fontSize: "1.6mm", fontWeight: 700, ...unaLinea }}>{e.SN}</div>
            </>
          )}
        </div>
        <Qr texto={e.URL} mm={15} />
      </div>

      {cargador ? (
        <div style={{ fontSize: "1.5mm", fontWeight: 700, textAlign: "center", borderTop: "0.2mm solid #000", paddingTop: "0.4mm" }}>Va junto al equipo {e.QF} · {e.FECHA}</div>
      ) : (
        <>
          {e.AVISO && (
            <div><span style={{ background: "#000", color: "#fff", fontSize: "1.6mm", fontWeight: 700, padding: "0.2mm 0.8mm", borderRadius: "0.4mm", whiteSpace: "pre" }}>{e.AVISO}</span></div>
          )}
          <div style={{ fontSize: "1.6mm", lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{e.FALLA}</div>
        </>
      )}
    </div>
  );
}

/** Vista previa a escala y botón que imprime las etiquetas del caso (equipo y, si lo dejó, cargador). */
export function ImprimirEtiquetas({ o, onCerrar }: { o: Orden; onCerrar: () => void }) {
  const lista = etiquetas(o);
  const imprimir = useRef<HTMLButtonElement>(null);

  // Esc cierra, el fondo no se desplaza y el foco va directo a "Imprimir".
  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (ev: KeyboardEvent) => ev.key === "Escape" && onCerrar();
    window.addEventListener("keydown", esc);
    imprimir.current?.focus();
    return () => { document.body.style.overflow = antes; window.removeEventListener("keydown", esc); };
  }, [onCerrar]);

  return (
    <>
      <style>{CSS_IMPRESION}</style>
      {createPortal(<div className="qf-imprimir" aria-hidden="true">{lista.map((e) => <EtiquetaQF key={e.PARTE} e={e} />)}</div>, document.body)}

      <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={onCerrar}>
        <div role="dialog" aria-modal="true" aria-labelledby="etiquetas-titulo" onClick={(ev) => ev.stopPropagation()}
          className="max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#111] p-6 sm:rounded-3xl md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="etiquetas-titulo" className="text-xl font-bold text-white">Etiquetas de {o.numero}</h2>
              <p className="mt-1 text-sm text-white/60">{lista.length === 2 ? "Una para el equipo y otra para el cargador." : "Una para el equipo."} Tamaño real 50 × 30 mm.</p>
            </div>
            <button type="button" onClick={onCerrar} aria-label="Cerrar" className={`${PRESS} -mr-2 -mt-1 rounded-full p-2 text-white/70 hover:bg-white/[0.08]`}>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            {lista.map((e) => (
              // Vista previa al 160 %: el contenedor reserva el tamaño ya escalado.
              <div key={e.PARTE} className="overflow-hidden rounded-lg ring-1 ring-white/10" style={{ width: "80mm", height: "48mm" }}>
                <div style={{ transform: "scale(1.6)", transformOrigin: "top left" }}><EtiquetaQF e={e} /></div>
              </div>
            ))}
          </div>

          <button ref={imprimir} type="button" onClick={() => window.print()}
            className={`${PRESS} mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-medium text-black hover:bg-[#ff7a1f]`}>
            <Printer className="h-5 w-5" aria-hidden="true" /> Imprimir {lista.length === 2 ? "2 etiquetas" : "etiqueta"}
          </button>
          <p className="mt-3 text-center text-sm text-white/50">En la ventana de impresión elige la impresora de etiquetas, con papel de 50 × 30 mm y márgenes en “Ninguno”.</p>
        </div>
      </div>
    </>
  );
}
