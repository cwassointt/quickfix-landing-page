import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { KeyRound, MessageCircle, Printer, X } from "lucide-react";
import qrcode from "qrcode-generator";
import { etiquetas, type Etiqueta, type Orden } from "@/lib/recepcion";

const PRESS = "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]";

// Rollo de 76 × 50 mm: en la impresora de etiquetas cada etiqueta sale como una "página".
// En pantalla la copia para imprimir queda fuera de vista (no display:none) para poder medir y ajustar la letra del resumen.
const CSS_IMPRESION = `
@media screen { .qf-imprimir { position: fixed; left: -300mm; top: 0; visibility: hidden; pointer-events: none; } }
@media print {
  @page { size: 76mm 50mm; margin: 0; }
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

/**
 * Todo el resumen en el espacio que queda: baja la letra de a 0.1 mm hasta que entra.
 * Con el máximo de 1000 caracteres del formulario entra hacia 1.5 mm; el piso de 1.2 mm es solo por seguridad.
 */
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
  return <div ref={ref} style={{ flex: 1, minHeight: 0, overflow: "hidden", lineHeight: 1.2, overflowWrap: "anywhere" }}>{texto}</div>;
}

/** Una línea que achica su letra hasta entrar completa (el código del modelo está al final y no se puede cortar). */
function Ajustada({ texto, max, min }: { texto: string; max: number; min: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    for (let mm = max; mm >= min; mm = Math.round((mm - 0.1) * 10) / 10) {
      el.style.fontSize = `${mm}mm`;
      if (el.scrollWidth <= el.clientWidth + 1) break;
    }
  }, [texto, max, min]);
  return <span ref={ref} style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{texto}</span>;
}

const unaLinea: CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const caja: CSSProperties = { width: "76mm", height: "50mm", boxSizing: "border-box", padding: "2mm 2.5mm", background: "#fff", color: "#000", display: "flex", flexDirection: "column", gap: "1.4mm", overflow: "hidden" };
// Banda negra de arriba: el N° del caso se reconoce de lejos en el estante.
const banda: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2mm", background: "#000", color: "#fff", borderRadius: "1.2mm", padding: "0.8mm 2.2mm", flexShrink: 0 };
const rotulo: CSSProperties = { fontSize: "1.9mm", fontWeight: 700, letterSpacing: "0.25mm", lineHeight: 1 };
const fila: CSSProperties = { display: "flex", alignItems: "center", gap: "1.2mm", minWidth: 0 };
const icono: CSSProperties = { width: "3mm", height: "3mm", flexShrink: 0 };
const marca = <span style={{ fontSize: "2.4mm", lineHeight: 1 }}>Quick<b>Fix</b>.pe</span>;

/** Una etiqueta de 76 × 50 mm, en negro sobre blanco para impresora térmica. Medidas en mm reales. */
export function EtiquetaQF({ e }: { e: Etiqueta }) {
  // Cargador: solo para saber de quién es y a qué equipo acompaña.
  if (e.PARTE === "CARGADOR") {
    return (
      <div className="qf-etiqueta" style={caja}>
        <div style={banda}>
          <span style={{ fontSize: "5.4mm", fontWeight: 700, lineHeight: 1 }}>{e.QF}</span>
          <span style={{ ...rotulo, fontSize: "2.6mm" }}>CARGADOR</span>
        </div>
        <div style={{ display: "flex", gap: "2.5mm", flex: 1, minHeight: 0, alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "4mm", fontWeight: 700, ...unaLinea }}>{e.CLIENTE}</div>
            <div style={{ fontSize: "2.8mm", lineHeight: 1.25, marginTop: "1mm" }}>{e.FALLA}</div>
            <div style={{ fontSize: "2.6mm", fontWeight: 700, marginTop: "2mm" }}>Va junto al equipo {e.QF}</div>
          </div>
          <Qr texto={e.URL} mm={20} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "2.2mm" }}>{marca}<span>Recibido {e.FECHA}</span></div>
      </div>
    );
  }

  return (
    <div className="qf-etiqueta" style={caja}>
      <div style={banda}>
        <span style={{ fontSize: "5.2mm", fontWeight: 700, letterSpacing: "-0.1mm", lineHeight: 1, whiteSpace: "nowrap" }}>{e.QF}</span>
        <span style={{ display: "flex", alignItems: "center", gap: "1.2mm", fontSize: "2.1mm", whiteSpace: "nowrap", minWidth: 0 }}>
          {e.AVISO && <span style={{ background: "#fff", color: "#000", fontWeight: 700, borderRadius: "0.6mm", padding: "0.3mm 0.9mm", whiteSpace: "pre" }}>{e.AVISO}</span>}
          <span>{e.FECHA}</span>
        </span>
      </div>

      {/* Modelo y serie a todo el ancho; si el modelo es largo se corta él, nunca la serie. */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "2mm", fontWeight: 700, lineHeight: 1.1, flexShrink: 0 }}>
        <Ajustada texto={e.EQUIPO} max={2.6} min={1.8} />
        <span className="qf-mono" style={{ fontSize: "2.4mm", whiteSpace: "nowrap" }}>{e.SN}</span>
      </div>

      {/* Izquierda: de quién es y cómo abrirlo. Derecha: todo el resumen, con la mayor altura posible. */}
      <div style={{ display: "flex", gap: "2.2mm", flex: 1, minHeight: 0 }}>
        <div style={{ width: "25mm", flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.9mm" }}>
          <div style={{ flexShrink: 0, fontSize: "3mm", fontWeight: 700, lineHeight: 1.1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", overflowWrap: "anywhere" }}>{e.CLIENTE}</div>
          <div style={{ ...fila, flexShrink: 0, fontSize: "2.8mm", fontWeight: 700 }}>
            <MessageCircle aria-label="WhatsApp" style={icono} strokeWidth={2.6} />
            <span style={{ whiteSpace: "nowrap" }}>{e.WHATSAPP || "—"}</span>
          </div>
          {/* La clave nunca se corta: si es larga, pasa a la línea siguiente. */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "flex-start", gap: "1mm", border: "0.35mm solid #000", borderRadius: "0.8mm", padding: "0.5mm 1mm" }}>
            <KeyRound aria-label="Clave del equipo" style={{ ...icono, marginTop: "0.1mm" }} strokeWidth={2.6} />
            <span className="qf-mono" style={{ fontSize: "2.9mm", fontWeight: 700, lineHeight: 1.1, overflowWrap: "anywhere", minWidth: 0 }}>{e.CLAVE}</span>
          </div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5mm" }}>
            <Qr texto={e.URL} mm={12.5} />
            {marca}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.8mm", borderLeft: "0.35mm solid #000", paddingLeft: "2.2mm" }}>
          <span style={rotulo}>RESUMEN</span>
          <Resumen texto={e.FALLA} max={3} />
        </div>
      </div>
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
              <p className="mt-1 text-sm text-white/60">{lista.length === 2 ? "Una para el equipo y otra para el cargador" : "Una para el equipo"}. Tamaño real 76 × 50 mm.</p>
            </div>
            <button type="button" onClick={onCerrar} aria-label="Cerrar" className={`${PRESS} -mr-2 -mt-1 rounded-full p-2 text-white/70 hover:bg-white/[0.08]`}>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            {lista.map((e) => (
              // Vista previa al 115 % (cabe en un celular): el contenedor reserva el tamaño ya escalado.
              <div key={e.PARTE} className="overflow-hidden rounded-lg ring-1 ring-white/10" style={{ width: "87.4mm", height: "57.5mm" }}>
                <div style={{ transform: "scale(1.15)", transformOrigin: "top left" }}><EtiquetaQF e={e} /></div>
              </div>
            ))}
          </div>

          <button ref={imprimir} type="button" onClick={() => window.print()}
            className={`${PRESS} mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-medium text-black hover:bg-[#ff7a1f]`}>
            <Printer className="h-5 w-5" aria-hidden="true" /> Imprimir {lista.length > 1 ? `${lista.length} etiquetas` : "etiqueta"}
          </button>
          <p className="mt-3 text-center text-sm text-white/50">En la ventana de impresión elige la impresora de etiquetas, con papel de 76 × 50 mm y márgenes en “Ninguno”.</p>
        </div>
      </div>
    </>
  );
}
