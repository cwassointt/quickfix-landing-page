import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { KeyRound, MessageCircle, Printer, X } from "lucide-react";
import qrcode from "qrcode-generator";
import { etiquetas, type Etiqueta, type Orden } from "@/lib/recepcion";

const PRESS = "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]";

// Rollo de 50 × 30 mm: en la impresora de etiquetas cada etiqueta sale como una "página".
// En pantalla la copia para imprimir queda fuera de vista (no display:none) para poder medir y ajustar la letra del resumen.
const CSS_IMPRESION = `
@media screen { .qf-imprimir { position: fixed; left: -300mm; top: 0; visibility: hidden; pointer-events: none; } }
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

/** Texto que llena el espacio que le queda: baja la letra de a 0.1 mm hasta que entra todo (mínimo 1.2 mm). */
function Resumen({ texto, max }: { texto: string; max: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    for (let mm = max; mm >= 1.2; mm = Math.round((mm - 0.1) * 10) / 10) {
      el.style.fontSize = `${mm}mm`;
      if (el.scrollHeight <= el.clientHeight + 1) break;
    }
  }, [texto, max]);
  return <div ref={ref} style={{ flex: 1, minHeight: 0, overflow: "hidden", lineHeight: 1.17, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{texto}</div>;
}

const unaLinea: CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const caja: CSSProperties = { width: "50mm", height: "30mm", boxSizing: "border-box", padding: "1.2mm 1.5mm 1mm", background: "#fff", color: "#000", display: "flex", flexDirection: "column", gap: "0.5mm", overflow: "hidden" };
const linea = <div style={{ height: "0.25mm", background: "#000", flexShrink: 0 }} />;
const chip: CSSProperties = { background: "#000", color: "#fff", fontSize: "1.5mm", fontWeight: 700, padding: "0.2mm 0.7mm", borderRadius: "0.4mm", whiteSpace: "pre" };

/** Una etiqueta de 50 × 30 mm, en negro sobre blanco para impresora térmica. Medidas en mm reales. */
export function EtiquetaQF({ e }: { e: Etiqueta }) {
  // Cargador: solo para saber de quién es y a qué equipo acompaña.
  if (e.PARTE === "CARGADOR") {
    return (
      <div className="qf-etiqueta" style={caja}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "1.8mm", fontWeight: 700 }}>Quick<span style={{ fontWeight: 400 }}>Fix</span>.pe</span>
          <span style={{ fontSize: "1.6mm", fontWeight: 700, border: "0.2mm solid #000", borderRadius: "0.4mm", padding: "0.2mm 0.8mm" }}>CARGADOR</span>
        </div>
        <div style={{ display: "flex", gap: "1.2mm", flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "4.4mm", fontWeight: 700, lineHeight: 1 }}>{e.QF}</div>
            <div style={{ fontSize: "2.2mm", fontWeight: 700, marginTop: "0.8mm", ...unaLinea }}>{e.CLIENTE}</div>
            <div style={{ fontSize: "1.7mm", lineHeight: 1.2, marginTop: "0.3mm" }}>{e.FALLA}</div>
          </div>
          <Qr texto={e.URL} mm={14} />
        </div>
        <div style={{ fontSize: "1.5mm", fontWeight: 700, textAlign: "center", borderTop: "0.2mm solid #000", paddingTop: "0.4mm" }}>Va junto al equipo {e.QF} · {e.FECHA}</div>
      </div>
    );
  }

  // Continuación: solo el resto del resumen, con el N° del caso para no mezclarlas.
  if (e.PARTE !== "EQUIPO") {
    return (
      <div className="qf-etiqueta" style={caja}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1mm" }}>
          <span style={{ fontSize: "2.6mm", fontWeight: 700, whiteSpace: "nowrap" }}>{e.QF} <span style={{ fontSize: "1.7mm" }}>· resumen {e.HOJA}</span></span>
          <span style={{ fontSize: "1.6mm", fontWeight: 700, minWidth: 0, ...unaLinea }}>{e.CLIENTE}</span>
        </div>
        {linea}
        <Resumen texto={e.FALLA} max={2.2} />
      </div>
    );
  }

  return (
    <div className="qf-etiqueta" style={caja}>
      <div style={{ display: "flex", gap: "1.2mm", flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.35mm" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.8mm" }}>
            <span style={{ fontSize: "3.6mm", fontWeight: 700, letterSpacing: "-0.1mm", lineHeight: 1 }}>{e.QF}</span>
            <span style={{ fontSize: "1.5mm", whiteSpace: "nowrap" }}>{e.FECHA}{e.HOJA && ` · ${e.HOJA}`}</span>
          </div>
          <div style={{ fontSize: "2.1mm", fontWeight: 700, lineHeight: 1.15, ...unaLinea }}>{e.CLIENTE}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6mm", fontSize: "2.1mm", fontWeight: 700, lineHeight: 1.15 }}>
            <MessageCircle aria-label="WhatsApp" style={{ width: "1.9mm", height: "1.9mm", flexShrink: 0 }} strokeWidth={2.6} />
            <span>{e.WHATSAPP || "—"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6mm", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5mm", border: "0.25mm solid #000", borderRadius: "0.5mm", padding: "0.1mm 0.7mm", maxWidth: "100%" }}>
              <KeyRound aria-label="Clave del equipo" style={{ width: "1.8mm", height: "1.8mm", flexShrink: 0 }} strokeWidth={2.6} />
              <span className="qf-mono" style={{ fontSize: "2.1mm", fontWeight: 700, ...unaLinea }}>{e.CLAVE}</span>
            </span>
            {e.AVISO && <span style={chip}>{e.AVISO}</span>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2mm" }}>
          <Qr texto={e.URL} mm={12} />
          <span style={{ fontSize: "1.3mm", fontWeight: 700, lineHeight: 1 }}>QuickFix.pe</span>
        </div>
      </div>
      {linea}
      <Resumen texto={e.HOJA ? `${e.FALLA} →` : e.FALLA} max={2} />
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
              <p className="mt-1 text-sm text-white/60">{[
                "Una para el equipo",
                lista.some((e) => e.PARTE.startsWith("RESUMEN")) && "el resumen sigue en otra porque no entra en una sola",
                lista.some((e) => e.PARTE === "CARGADOR") && "otra para el cargador",
              ].filter(Boolean).join("; ")}. Tamaño real 50 × 30 mm.</p>
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
            <Printer className="h-5 w-5" aria-hidden="true" /> Imprimir {lista.length > 1 ? `${lista.length} etiquetas` : "etiqueta"}
          </button>
          <p className="mt-3 text-center text-sm text-white/50">En la ventana de impresión elige la impresora de etiquetas, con papel de 50 × 30 mm y márgenes en “Ninguno”.</p>
        </div>
      </div>
    </>
  );
}
