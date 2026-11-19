import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Check, FileDown, Loader2, Plus, Sparkles, X } from "lucide-react";
import { api, equipo, telefono, type Orden } from "@/lib/recepcion";
import { RESULTADOS, conBase, fechaInforme, informeNuevo, limpiarTexto, soles, total, type Cobro, type Fila, type Informe, type Respuesta, type Texto } from "@/lib/informe";

const PRESS = "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";
const CAMPO = "w-full rounded-xl bg-white/[0.06] px-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary [&>option]:bg-[#111]";
// Estilo de la web, en blanco: Inter, titulares gruesos, naranja #FF6600, píldoras y una tarjeta gris clara.
const NARANJA = "#FF6600";
const TINTA = "#0a0a0a";
const TEXTO = "#262626";
const GRIS = "#737373";

// La web fuerza su propia letra con !important, así que el informe repite Inter con la misma fuerza.
// Al imprimir, solo sale el informe en A4.
const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
.qf-informe, .qf-informe * { font-family: Inter, system-ui, sans-serif !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.qf-informe [contenteditable="true"] { border-radius: 3px; outline: none; cursor: text; }
.qf-informe [contenteditable="true"]:hover { background: #fff7ed; }
.qf-informe [contenteditable="true"]:focus { background: #fff7ed; box-shadow: 0 0 0 2px ${NARANJA}; }
@media screen { .qf-informe-print { display: none; } }`;

// Solo se monta mientras se imprime el informe: si quedara puesto, ocultaría las etiquetas al imprimirlas (salían en blanco).
const CSS_IMPRESION = `
@media print {
  @page { size: A4; margin: 14mm 15mm 16mm;
    @bottom-right { content: "Página " counter(page) " de " counter(pages); font: 500 8pt Inter, sans-serif; color: ${GRIS}; }
  }
  .qf-informe p, .qf-informe li { orphans: 3; widows: 3; }
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  body > *:not(.qf-informe-print) { display: none !important; }
  .qf-informe-print { display: block; }
  .qf-punto, .qf-informe tr { break-inside: avoid; }
  .qf-informe h2 { break-after: avoid; }
}`;

/** Texto que se corrige escribiendo encima (solo en pantalla). Guarda al salir del campo. */
function Ed({ v, set, editable, style, vacio = "[Escribe aquí]" }: { v: string; set: (t: string) => void; editable: boolean; style?: CSSProperties; vacio?: string }) {
  if (!editable) return <span style={{ whiteSpace: "pre-wrap", ...style }}>{v}</span>;
  return (
    // key={v}: se vuelve a montar cuando cambia el valor, porque React no puede reconciliar texto que el navegador ya editó.
    <span key={v} contentEditable suppressContentEditableWarning role="textbox" aria-label="Texto del informe" style={{ whiteSpace: "pre-wrap", ...style }}
      onBlur={(e) => { const t = e.currentTarget.innerText.trim(); if (t !== v && t !== vacio) set(t); }}>
      {v || vacio}
    </span>
  );
}

const Seccion = ({ children }: { children: ReactNode }) => (
  <h2 style={{ margin: "28px 0 10px", fontSize: "17px", fontWeight: 800, letterSpacing: "-0.4px", color: TINTA, textAlign: "left" }}>{children}</h2>
);

const Logo = ({ size }: { size: string }) => (
  <span style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.04em", color: TINTA }}>Quick<span style={{ color: NARANJA }}>Fix</span></span>
);

const QUITAR = "ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full align-middle text-[#9a3412] hover:bg-[#ffedd5]";

/** Viñetas "Título: texto" de una sección, editables. */
function Lista({ filas, set, editable, nueva }: { filas: Fila[]; set: (f: Fila[]) => void; editable: boolean; nueva: string }) {
  const cambiar = (i: number, f: Partial<Fila>) => set(filas.map((x, j) => (j === i ? { ...x, ...f } : x)));
  return (
    <>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {filas.map((f, i) => (
          <li key={i} className="qf-punto" style={{ display: "flex", gap: "12px", margin: "0 0 10px" }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: "7px", height: "7px", marginTop: "7px", borderRadius: "999px", background: NARANJA }} />
            <span style={{ color: TEXTO }}>
              <Ed v={f.titulo} set={(t) => cambiar(i, { titulo: t })} editable={editable} style={{ fontWeight: 700, color: TINTA }} />
              <b style={{ color: TINTA }}>: </b>
              <Ed v={f.texto} set={(t) => cambiar(i, { texto: t })} editable={editable} />
              {editable && <button type="button" onClick={() => set(filas.filter((_, j) => j !== i))} aria-label={`Quitar "${f.titulo}"`} className={QUITAR}><X className="h-3.5 w-3.5" aria-hidden="true" /></button>}
            </span>
          </li>
        ))}
      </ul>
      {editable && (
        <button type="button" onClick={() => set([...filas, { titulo: nueva, texto: "" }])}
          className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[13px] font-medium text-[#9a3412] hover:bg-[#ffedd5]">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Agregar punto
        </button>
      )}
    </>
  );
}

const pildora = (fondo: string): CSSProperties => ({ fontSize: "12px", fontWeight: 700, color: "#fff", background: fondo, borderRadius: "999px", padding: "5px 14px", whiteSpace: "nowrap" });

/**
 * El informe en A4 con el estilo de la web (diseño en Claude Design: "Informe técnico QuickFix").
 * Lo que el cliente busca primero (estado y total) va arriba; texto alineado a la izquierda y montos en columna.
 */
function Documento({ o, inf, set, onEstado, editable }: { o: Orden; inf: Informe & { texto: Texto }; set: (t: Texto) => void; onEstado: (r: string) => void; editable: boolean }) {
  const t = inf.texto;
  const cambiar = (c: Partial<Texto>) => set({ ...t, ...c });
  const suma = total(inf.cobros);
  const saldo = inf.adelanto != null ? Math.round((suma - inf.adelanto) * 100) / 100 : null;
  const id = o.serie ? ["S/N", o.serie] : o.dni ? ["DNI", o.dni] : ["S/N", "—"];
  const reparable = t.estado === "REPARABLE";
  const cifra: CSSProperties = { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", textAlign: "right" };
  const etiqueta: CSSProperties = { fontSize: "11px", fontWeight: 500, color: GRIS };
  const dato = (k: string, v: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
      <span style={etiqueta}>{k}</span><span style={{ fontSize: "13px", fontWeight: 600, overflowWrap: "anywhere" }}>{v}</span>
    </div>
  );
  const estadoPildora = editable ? (
    <select value={t.estado} onChange={(e) => onEstado(e.target.value)} aria-label="Estado del equipo"
      style={{ ...pildora(reparable ? NARANJA : TINTA), border: 0, font: "inherit", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
      {RESULTADOS.map((r) => <option key={r} value={r}>{r === "REPARABLE" ? "Reparable" : "No reparable"}</option>)}
    </select>
  ) : (
    <span style={pildora(reparable ? NARANJA : TINTA)}>{reparable ? "Reparable" : "No reparable"}</span>
  );
  return (
    <article className="qf-informe" style={{ background: "#fff", color: TINTA, fontSize: "13px", lineHeight: 1.6, textAlign: "left" }}>
      <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <Logo size="22px" />
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
          <span style={{ fontSize: "11px", fontWeight: 500, color: "#525252", border: "1px solid #e5e5e5", borderRadius: "999px", padding: "5px 12px" }}>Informe técnico</span>
          <span style={pildora(NARANJA)}>{o.numero}</span>
        </div>
      </header>

      <div style={{ marginTop: "32px" }}>
        <h1 style={{ margin: 0, fontSize: "44px", fontWeight: 800, letterSpacing: "-1.8px", lineHeight: 1 }}>Repair Service Report</h1>
        <p style={{ margin: "12px 0 0", fontSize: "13px", color: "#525252" }}>Diagnóstico y reparación de laboratorio · {fechaInforme(inf.fecha)} · Hecho por gianluca pasquale</p>
      </div>

      <section aria-label="Datos del caso" style={{ marginTop: "22px", background: "#f5f5f5", borderRadius: "18px", padding: "16px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px 16px" }}>
          {dato("Cliente", o.nombre)}
          {dato("Equipo", equipo(o))}
          {dato(id[0], id[1])}
          {dato("WhatsApp", o.whatsapp ? telefono(o.whatsapp) : "—")}
        </div>
        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #e5e5e5", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px 24px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={etiqueta}>Estado del equipo</span>{estadoPildora}</span>
          <span style={{ display: "flex", alignItems: "baseline", gap: "10px" }}><span style={etiqueta}>Inversión total</span><b style={{ ...cifra, fontSize: "18px", fontWeight: 800, letterSpacing: "-0.4px" }}>{soles(suma)}</b></span>
        </div>
      </section>

      <Seccion>Resumen de inversión</Seccion>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #d4d4d4" }}>
            <th scope="col" style={{ ...etiqueta, padding: "0 24px 6px 0", textAlign: "left" }}>Concepto</th>
            <th scope="col" style={{ ...etiqueta, padding: "0 0 6px", textAlign: "right" }}>Monto</th>
          </tr>
        </thead>
        <tbody>
          {inf.cobros.map((c, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #e5e5e5" }}>
              <td style={{ padding: "10px 24px 10px 0", verticalAlign: "top" }}>
                <Ed v={t.conceptos[i] ?? c.concepto} set={(v) => cambiar({ conceptos: inf.cobros.map((x, j) => (j === i ? v : t.conceptos[j] ?? x.concepto)) })} editable={editable} />
                {c.nota && <div style={{ marginTop: "2px", fontSize: "11.5px", color: GRIS }}>{c.nota}</div>}
              </td>
              <td style={{ ...cifra, padding: "10px 0", verticalAlign: "top", fontWeight: 700 }}>{soles(c.monto)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="qf-punto" style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", background: NARANJA, color: "#fff", borderRadius: "999px", padding: "10px 22px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700 }}>Inversión total a cancelar</span>
        <span style={{ ...cifra, fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px" }}>{soles(suma)}</span>
      </div>
      {inf.adelanto != null && saldo != null && (
        <div style={{ marginTop: "8px", padding: "0 22px", display: "grid", gridTemplateColumns: "1fr auto", gap: "2px 16px" }}>
          <span style={{ color: TEXTO }}>Adelanto recibido</span><span style={cifra}>{soles(inf.adelanto)}</span>
          <b>{saldo < 0 ? "Saldo a devolver" : "Saldo pendiente"}</b><b style={cifra}>{soles(Math.abs(saldo))}</b>
        </div>
      )}

      <Seccion>Diagnóstico de precisión</Seccion>
      {(t.antecedentes || editable) && (
        <p style={{ margin: "0 0 10px", color: TEXTO }}><b style={{ color: TINTA }}>Antecedentes del caso: </b><Ed v={t.antecedentes} set={(v) => cambiar({ antecedentes: v })} editable={editable} vacio="[Solo si la falla surgió después de una entrega; si no, déjalo vacío]" /></p>
      )}
      <p style={{ margin: "0 0 12px", color: TEXTO }}><Ed v={t.intro} set={(v) => cambiar({ intro: v })} editable={editable} /></p>
      <Lista filas={t.diagnostico} set={(f) => cambiar({ diagnostico: f })} editable={editable} nueva="Nuevo hallazgo" />

      <Seccion>Protocolo de solución ejecutado</Seccion>
      <Lista filas={t.protocolo} set={(f) => cambiar({ protocolo: f })} editable={editable} nueva="Nueva acción" />

      <Seccion>{reparable ? "Resultado y validación" : "Dictamen técnico"}</Seccion>
      <Lista filas={t.cierre} set={(f) => cambiar({ cierre: f })} editable={editable} nueva={reparable ? "Pruebas de Validación" : "Justificación Técnica"} />

      <Seccion>Observaciones de ingeniería y recomendaciones</Seccion>
      <Lista filas={t.observaciones} set={(f) => cambiar({ observaciones: f })} editable={editable} nueva="Sobre " />

      <footer className="qf-punto" style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid #e5e5e5", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px 16px", fontSize: "11px", color: GRIS }}>
        <span><b style={{ color: TINTA }}>Departamento Técnico de Laboratorio</b> · <Logo size="11px" />.pe · San Miguel, Lima</span>
        <span>quickfix.pe · 940-755-119 · quickfix.pe24@gmail.com</span>
      </footer>
    </article>
  );
}

function Area({ label, ayuda, v, set, filas = 4 }: { label: string; ayuda: string; v: string; set: (v: string) => void; filas?: number }) {
  return (
    <label className="block text-sm text-white/60">
      {label}
      <textarea value={v} onChange={(e) => set(e.target.value)} rows={filas} placeholder={ayuda} className={`${CAMPO} mt-1.5 py-3 leading-relaxed`} />
    </label>
  );
}

/** Solo admin: notas del técnico → borrador con IA → revisión en el documento → PDF. */
export function InformeTecnico({ o }: { o: Orden }) {
  const [inf, setInf] = useState<Informe | null>(null);
  const [estado, setEstado] = useState<"" | "preguntando" | "redactando" | "guardando" | "guardado">("");
  const [error, setError] = useState("");
  const [imprimiendo, setImprimiendo] = useState(false);
  const [filasVer, setFilasVer] = useState(0);
  // null: la IA todavía no preguntó; con preguntas, el técnico responde antes de redactar.
  const [preguntas, setPreguntas] = useState<Respuesta[] | null>(null);

  useEffect(() => {
    api<{ informe: Informe | null }>("informe", undefined, `&id=${o.id}`)
      .then((r) => {
        if (!r.informe) return setInf(informeNuevo());
        const n = r.informe.notas;
        // Los informes de antes tenían "qué se hizo" aparte: se junta con las notas.
        const notas = n.trabajo?.trim() ? { ...n, hallazgos: `${n.hallazgos.trim()}\n${n.trabajo.trim()}`, trabajo: "" } : n;
        setInf({ ...r.informe, notas, cobros: conBase(r.informe.cobros, n.resultado) });
      })
      .catch((e) => { setError((e as Error).message); setInf(informeNuevo()); });
  }, [o.id]);

  // Imprime solo cuando el informe ya está montado para impresión; el nombre del PDF sigue la costumbre del laboratorio.
  useEffect(() => {
    if (!imprimiendo || !inf) return;
    const antes = document.title;
    const fecha = new Date(`${inf.fecha.slice(0, 10)}T12:00:00`);
    const ddmmaa = fecha.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, "");
    const codigo = (o.modelo.trim().split(/\s+/).pop() || o.tipo).toUpperCase().replace(/[^A-Z0-9]/g, "");
    document.title = `${o.numero}-${inf.texto?.estado === "REPARABLE" ? "QFR" : "QFD"}${ddmmaa}_${codigo}`;
    const fin = () => { document.title = antes; setImprimiendo(false); };
    window.addEventListener("afterprint", fin, { once: true });
    const t = setTimeout(() => window.print(), 100);
    return () => { clearTimeout(t); window.removeEventListener("afterprint", fin); document.title = antes; };
  }, [imprimiendo, inf, o]);

  if (!inf) return <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin text-white/50" aria-label="Cargando informe" />;

  const set = (c: Partial<Informe>) => { setInf({ ...inf, ...c }); setEstado(""); };
  const notas = (c: Partial<Informe["notas"]>) => set({ notas: { ...inf.notas, ...c } });
  const cobro = (i: number, c: Partial<Cobro>) => set({ cobros: inf.cobros.map((x, j) => (j === i ? { ...x, ...c } : x)) });
  // El estado manda el primer cobro (diagnóstico 99 o reparación 299); se cambia igual desde el formulario o desde el documento.
  const cambiarResultado = (r: string) => {
    const cobros = conBase(inf.cobros, r);
    const cambio = cobros !== inf.cobros;
    const texto = inf.texto && { ...inf.texto, estado: r, conceptos: cobros.map((c, i) => (i === 0 && cambio ? c.concepto : inf.texto!.conceptos[i] ?? c.concepto)) };
    set({ notas: { ...inf.notas, resultado: r }, cobros, texto });
    if (cambio) setFilasVer(filasVer + 1);
  };

  const guardar = async (datos: Informe) => {
    setEstado("guardando");
    try { await api("informe", { id: o.id, informe: datos }); setEstado("guardado"); setError(""); return true; }
    catch (e) { setError((e as Error).message); setEstado(""); return false; }
  };

  const redactar = async (respuestas: Respuesta[]) => {
    setEstado("redactando");
    const notas = { ...inf.notas, respuestas };
    // El servidor redacta en segundo plano (tarda más de lo que el hosting deja abierta una conexión): se consulta cada 4 s, hasta 5 min.
    let r = await api<{ borrador?: unknown; pendiente?: boolean }>("redactar", { id: o.id, notas, cobros: inf.cobros });
    for (let i = 0; r.pendiente && i < 75; i++) {
      await new Promise((ok) => setTimeout(ok, 4000));
      r = await api<{ borrador?: unknown; pendiente?: boolean }>("borrador", undefined, `&id=${o.id}`);
    }
    if (r.pendiente) throw new Error("La IA está tardando demasiado. Intenta de nuevo en un momento.");
    const nuevo = { ...inf, notas, texto: limpiarTexto(r.borrador, inf.cobros, inf.notas.resultado), fecha: inf.fecha || new Date().toISOString() };
    setInf(nuevo);
    setPreguntas(null);
    await guardar(nuevo);
  };

  // Primero la IA pregunta lo que le falta (en mantenimientos casi nunca); sin preguntas, redacta de una vez.
  const generar = async () => {
    setError("");
    try {
      if (preguntas) return await redactar(preguntas);
      if (inf.texto && !confirm("Ya hay un informe. ¿Reemplazarlo por uno nuevo? Se perderán los cambios que hiciste en el texto.")) return;
      setEstado("preguntando");
      const r = await api<{ preguntas: string[] }>("preguntas", { id: o.id, notas: inf.notas, cobros: inf.cobros });
      if (r.preguntas.length) { setPreguntas(r.preguntas.map((p) => ({ pregunta: p, respuesta: "" }))); setEstado(""); return; }
      await redactar([]);
    } catch (e) { setError((e as Error).message); setEstado(""); }
  };

  const conTexto = inf.texto ? (inf as Informe & { texto: Texto }) : null;
  const montoValido = inf.cobros.every((c) => Number.isFinite(c.monto) && c.monto >= 0);

  return (
    <section className="mt-4 rounded-3xl bg-white/[0.04] p-5 md:p-6">
      <style>{CSS}</style>
      {imprimiendo && <style>{CSS_IMPRESION}</style>}
      <h2 className="text-lg font-bold text-white">Informe técnico</h2>
      <p className="mt-1 text-sm text-white/55">Escribe todo junto, como se lo contarías a otro técnico. La IA lo ordena con el formato del laboratorio, te pregunta lo que le falte y tú revisas el informe antes del PDF.</p>

      <div className="mt-5 space-y-4">
        <Area label="Notas del caso" ayuda="Ej.: corto en el riel de 5V del standby, IC de carga caliente con inyección de tensión; cambié el IC con aire caliente, reprogramé la BIOS con el programador SPI y quedó encendiendo; 2 h de estrés sin cortes…" v={inf.notas.hallazgos} set={(v) => notas({ hallazgos: v })} filas={7} />
        <label className="block text-sm text-white/60">
          Resultado
          <select value={inf.notas.resultado} onChange={(e) => cambiarResultado(e.target.value)} className={`${CAMPO} mt-1.5 h-12`}>
            {RESULTADOS.map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
          </select>
        </label>
        <Area label="Contexto adicional (opcional)" ayuda="Ej.: la falla apareció después de la entrega porque el cliente reinstaló el sistema; se le prometió que encendería; se devuelve con cargador y placa donante…" v={inf.notas.contexto} set={(v) => notas({ contexto: v })} filas={3} />

        <fieldset>
          <legend className="text-sm text-white/60">Cobros (el total lo calcula la página)</legend>
          <div className="mt-2 space-y-3">
            {inf.cobros.map((c, i) => (
              // El monto es un campo no controlado (para poder escribir "99." sin que se borre el punto); al quitar una fila, todas se vuelven a montar.
              <div key={`${filasVer}-${i}`} className="rounded-2xl bg-black/30 p-3">
                <div className="flex gap-2">
                  <input value={c.concepto} onChange={(e) => cobro(i, { concepto: e.target.value })} placeholder={i === 0 ? "Concepto (ej.: Mantenimiento Paquete ROG)" : "Concepto (ej.: cambio de pantalla)"} aria-label={`Concepto ${i + 1}`} className={`${CAMPO} h-11 flex-1`} />
                  <span className="relative w-32 shrink-0">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50">S/.</span>
                    <input inputMode="decimal" defaultValue={Number.isFinite(c.monto) ? String(c.monto) : ""} aria-label={`Monto ${i + 1}`}
                      onChange={(e) => cobro(i, { monto: e.target.value.trim() === "" ? 0 : Number(e.target.value.replace(",", ".")) })} className={`${CAMPO} h-11 pl-10 pr-3 text-right`} />
                  </span>
                  <button type="button" onClick={() => { set({ cobros: inf.cobros.filter((_, j) => j !== i) }); setFilasVer(filasVer + 1); }} aria-label={`Quitar cobro ${i + 1}`} disabled={i === 0}
                    className={`${PRESS} rounded-full p-2.5 text-white/60 hover:bg-white/[0.08] disabled:invisible`}><X className="h-5 w-5" aria-hidden="true" /></button>
                </div>
                <input value={c.nota} onChange={(e) => cobro(i, { nota: e.target.value })} placeholder="Nota opcional: Bonificado / Incluido en la reparación; precio regular S/. 99.00" aria-label={`Nota del cobro ${i + 1}`} className={`${CAMPO} mt-2 h-10 text-sm`} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => set({ cobros: [...inf.cobros, { concepto: "", monto: 0, nota: "" }] })} className={`${PRESS} inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-white/80 hover:bg-white/[0.08]`}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Agregar cobro
            </button>
            <label className="flex items-center gap-2 text-sm text-white/60">
              Adelanto
              <input inputMode="decimal" defaultValue={inf.adelanto ?? ""} placeholder="—" aria-label="Adelanto recibido en soles"
                onChange={(e) => set({ adelanto: e.target.value.trim() === "" ? null : Number(e.target.value.replace(",", ".")) })} className={`${CAMPO} h-10 w-24 text-right`} />
            </label>
            <p className="w-full text-right text-base text-white">Total: <b>{montoValido ? soles(total(inf.cobros)) : "revisa los montos"}</b></p>
          </div>
        </fieldset>
      </div>

      {preguntas && (
        <fieldset className="mt-5 rounded-2xl bg-primary/[0.08] p-4 ring-1 ring-primary/30">
          <legend className="sr-only">Preguntas de la IA</legend>
          <p className="font-medium text-white">Antes de redactar, la IA necesita saber:</p>
          <p className="mt-1 text-sm text-white/55">Responde en pocas palabras. Si dejas una vacía, ese detalle no sale en el informe.</p>
          {preguntas.map((p, i) => (
            <label key={i} className="mt-4 block text-sm text-white/85">
              {p.pregunta}
              <input value={p.respuesta} onChange={(e) => setPreguntas(preguntas.map((x, j) => (j === i ? { ...x, respuesta: e.target.value } : x)))} className={`${CAMPO} mt-1.5 h-11`} />
            </label>
          ))}
        </fieldset>
      )}

      <button type="button" onClick={generar} disabled={estado === "preguntando" || estado === "redactando" || !inf.notas.hallazgos.trim() || !montoValido}
        className={`${PRESS} mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-medium text-black hover:bg-[#ff7a1f] disabled:opacity-50`}>
        {estado === "preguntando" ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Revisando tus notas…</>
          : estado === "redactando" ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Redactando… puede tardar 1 a 3 minutos</>
          : <><Sparkles className="h-5 w-5" aria-hidden="true" /> {preguntas ? "Generar informe con mis respuestas" : inf.texto ? "Volver a generar con IA" : "Generar informe con IA"}</>}
      </button>
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-500/15 px-5 py-4 text-red-200">{error}</p>}

      {conTexto && (
        <div className="mt-6">
          {conTexto.texto.para_validar.length > 0 && (
            <div className="mb-4 rounded-2xl bg-[#ff9b80]/[0.1] p-4 ring-1 ring-[#ff9b80]/40">
              <p className="flex items-center gap-2 font-medium text-[#ffb59f]"><AlertTriangle className="h-5 w-5" aria-hidden="true" /> Para validar antes de enviar</p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-white/85">{conTexto.texto.para_validar.map((p, i) => <li key={i}>{p}</li>)}</ul>
              <p className="mt-2 text-sm text-white/55">Corrige en el documento cada <b>[POR CONFIRMAR]</b>.</p>
            </div>
          )}
          <p className="mb-2 text-sm text-white/55">Toca cualquier texto del informe para corregirlo.</p>
          <div className="overflow-x-auto rounded-2xl bg-white p-5 sm:p-8">
            <Documento o={o} inf={conTexto} set={(t) => set({ texto: t })} onEstado={cambiarResultado} editable />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            {estado === "guardado" && <span className="mr-auto flex items-center gap-1.5 text-sm text-white/60"><Check className="h-4 w-4 text-primary" aria-hidden="true" /> Guardado</span>}
            <button type="button" onClick={() => guardar(inf)} disabled={estado === "guardando"} className={`${PRESS} rounded-full bg-white/[0.08] px-5 py-3 text-base text-white hover:bg-white/[0.14] disabled:opacity-60`}>Guardar cambios</button>
            <button type="button" onClick={async () => { if (await guardar(inf)) setImprimiendo(true); }} className={`${PRESS} inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-base font-medium text-black hover:bg-white/90`}>
              <FileDown className="h-5 w-5" aria-hidden="true" /> Guardar PDF
            </button>
          </div>
          <p className="mt-2 text-right text-sm text-white/45">En la ventana de impresión elige “Guardar como PDF”.</p>
        </div>
      )}

      {imprimiendo && conTexto && createPortal(<div className="qf-informe-print"><Documento o={o} inf={conTexto} set={() => {}} onEstado={() => {}} editable={false} /></div>, document.body)}
    </section>
  );
}
