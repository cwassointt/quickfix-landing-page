import { useCallback, useEffect, useState } from "react";
import { Check, Download, Loader2, LogOut, Plus, Printer, RefreshCw } from "lucide-react";
import { API, ESTADOS, aCsv, api, chatCliente, diaLima, equipo, etiquetas, fecha, type Orden, type Rol } from "@/lib/recepcion";

const PRESS = "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";
const BTN = `${PRESS} inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base`;

/** Etiquetas de 50 × 30 mm (una para el equipo, otra para el cargador). Solo se ven al imprimir. */
const ETIQUETA_CSS = `
@media print {
  @page { size: 50mm 30mm; margin: 0; }
  html, body { background: #fff !important; }
  body * { visibility: hidden; }
  .qf-etiquetas, .qf-etiquetas * { visibility: visible; color: #000 !important; font-family: Arial, sans-serif !important; }
  .qf-etiquetas { position: absolute; left: 0; top: 0; display: block !important; }
  .qf-etiqueta { width: 50mm; height: 30mm; padding: 2mm 2.5mm; box-sizing: border-box; overflow: hidden; break-after: page; }
}`;

const linea = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as const;

/** Diseño 50 × 30 mm: servicio y fecha, N° grande con aviso en negro, cliente, equipo, S/N y la falla en 2 líneas. */
const Etiquetas = ({ o }: { o: Orden }) => (
  <div className="qf-etiquetas hidden" aria-hidden="true">
    {etiquetas(o).map((e) => (
      <div key={e.PARTE} className="qf-etiqueta" style={{ fontSize: "6.5pt", lineHeight: 1.18, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1mm", fontWeight: 700, fontSize: "5.5pt", letterSpacing: "0.02em" }}>
          <span>QUICKFIX · {e.PARTE === "CARGADOR" ? "CARGADOR" : e.SERVICIO}</span><span>{e.FECHA}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.2mm", margin: "0.4mm 0 0.6mm" }}>
          {/* El N° nunca se parte; el aviso usa el espacio que queda (hasta 2 líneas). */}
          <span style={{ fontSize: "16pt", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em", whiteSpace: "nowrap", flexShrink: 0 }}>{e.QF}</span>
          {e.AVISO && (
            <span style={{ background: "#000", color: "#fff", fontWeight: 700, fontSize: "5pt", lineHeight: 1.15, padding: "0.5mm 0.8mm", borderRadius: "0.6mm", minWidth: 0 }}>
              ⚠ {e.AVISO}
            </span>
          )}
        </div>
        <div style={{ ...linea, fontWeight: 700, fontSize: "7pt" }}>{e.CLIENTE}</div>
        <div style={linea}>{e.EQUIPO}</div>
        <div style={{ ...linea, fontFamily: "Consolas, monospace" }}>{e.SN}</div>
        <div style={{ marginTop: "auto", borderTop: "0.2mm solid #000", paddingTop: "0.5mm", fontSize: "5.5pt", lineHeight: 1.15,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {e.FALLA}
        </div>
      </div>
    ))}
  </div>
);

/** Baja las etiquetas como CSV para imprimirlas desde OpenLabel+ (plantilla "QuickFix"). */
function descargarCsv(o: Orden) {
  const url = URL.createObjectURL(new Blob([aCsv(etiquetas(o))], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `etiqueta-${o.numero}.csv` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Login({ onEntrar }: { onEntrar: (r: Rol) => void }) {
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  return (
    <form
      className="mx-auto mt-10 max-w-sm space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setCargando(true);
        try { onEntrar((await api<{ rol: Rol }>("entrar", { clave })).rol); }
        catch (err) { setError((err as Error).message); }
        setCargando(false);
      }}
    >
      <label className="block text-base text-white">
        Clave del taller
        <input type="password" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} autoFocus
          className="mt-2 h-12 w-full rounded-xl bg-white/[0.06] px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
      </label>
      {error && <p role="alert" className="text-red-300">{error}</p>}
      <button disabled={cargando || !clave} className={`${BTN} w-full bg-primary font-medium text-black hover:bg-[#ff7a1f] disabled:opacity-60`}>Entrar</button>
    </form>
  );
}

const Dato = ({ k, v }: { k: string; v: string | null | undefined }) =>
  v ? <div><dt className="text-sm text-white/50">{k}</dt><dd className="text-base text-white">{v}</dd></div> : null;

function Tarjeta({ o, rol, onRecibir, onImprimir }: { o: Orden; rol: Rol; onRecibir: () => void; onImprimir: () => void }) {
  const pendiente = o.estado === "registrado";
  const hoy = diaLima();
  const avisos = [o.liquido === 1 && "Recibió líquido o golpe", o.abierto === 1 && "Lo abrió otro técnico"].filter(Boolean) as string[];
  return (
    <article className={`rounded-3xl p-5 md:p-6 ${pendiente ? "bg-primary/[0.12] ring-1 ring-primary/40" : "bg-white/[0.04]"}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-3xl font-bold text-primary">{o.numero}</p>
        <p className="text-sm text-white/60">{ESTADOS[o.estado] ?? o.estado} · {fecha(o.creado)}{o.origen === "taller" ? " · registrado en el taller" : ""}</p>
      </div>
      <p className="mt-2 text-xl font-bold text-white">{o.nombre}</p>
      <p className="text-lg text-white/85">{o.tipo} · {equipo(o)}</p>
      {avisos.length > 0 && <p className="mt-2 text-base font-medium text-red-300">{avisos.join(" · ")}</p>}
      {pendiente && (o.llega || o.modo === "recojo") && (
        <p className="mt-3 rounded-2xl bg-black/30 px-4 py-3 text-base text-white">
          {o.modo === "recojo" ? <><span className="font-medium text-primary">Recojo en casa</span> · {o.direccion}{o.distrito ? `, ${o.distrito}` : ""}</> : "Lo trae al taller"}
          {o.llega && ` · ${o.llega === hoy ? "hoy" : new Date(`${o.llega}T12:00`).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "short" })}`}
        </p>
      )}
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Dato k="N° de serie" v={o.serie} />
        <Dato k="Deja también" v={o.accesorios} />
        <Dato k="Servicio" v={o.servicio} />
        {rol === "admin" && <><Dato k="WhatsApp" v={o.whatsapp} /><Dato k="DNI" v={o.dni} /><Dato k="Correo" v={o.correo} /><Dato k="Distrito" v={o.distrito} /><Dato k="Clave del equipo" v={o.pin} /><Dato k="Nos conoció por" v={o.como} />
          <Dato k="Reparar sin consultar" v={o.autoriza ? `Hasta S/ ${o.autoriza}` : "No, consultar antes"} /></>}
      </dl>
      {o.foto === 1 && (
        <a href={`${API}?accion=foto&id=${o.id}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
          <img src={`${API}?accion=foto&id=${o.id}`} alt={`Etiqueta de ${o.numero}`} loading="lazy" className="h-24 rounded-xl object-cover" />
        </a>
      )}
      <p className="mt-4 whitespace-pre-line rounded-2xl bg-black/30 p-4 text-base text-white/85">{o.falla}</p>
      {o.recibido && <p className="mt-3 text-sm text-white/50">Recibido {fecha(o.recibido)} · {o.recibido_por === "mostrador" ? "mostrador" : "tú"}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        {/* La impresora térmica imprime desde OpenLabel+: "Recibido" baja el CSV de las etiquetas para importarlo allí. */}
        {pendiente ? (
          <button onClick={() => { onRecibir(); descargarCsv(o); }} className={`${BTN} bg-primary font-medium text-black hover:bg-[#ff7a1f]`}>
            <Check className="h-5 w-5" aria-hidden="true" /> Recibido · bajar etiquetas
          </button>
        ) : (
          <button onClick={() => descargarCsv(o)} className={`${BTN} bg-white/[0.08] text-white hover:bg-white/[0.14]`}>
            <Download className="h-5 w-5" aria-hidden="true" /> Etiquetas OpenLabel+
          </button>
        )}
        <button onClick={onImprimir} aria-label="Imprimir etiquetas desde el navegador" title="Imprimir desde el navegador"
          className={`${BTN} bg-white/[0.08] px-4 text-white hover:bg-white/[0.14]`}>
          <Printer className="h-5 w-5" aria-hidden="true" />
        </button>
        {rol === "admin" && o.whatsapp && (
          <a href={chatCliente(o.whatsapp, `Hola ${o.nombre.split(" ")[0]}, te escribo de QuickFix por tu ${equipo(o)} (${o.numero}).`)} target="_blank" rel="noopener noreferrer"
            className={`${BTN} bg-white/[0.08] text-white hover:bg-white/[0.14]`}>
            WhatsApp
          </a>
        )}
      </div>
    </article>
  );
}

/** Pantalla del taller: tus padres reciben equipos e imprimen etiquetas; tú ves todo. */
const TallerPage = () => {
  const [rol, setRol] = useState<Rol | null | undefined>(undefined);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [filtro, setFiltro] = useState<"pendientes" | "todos">("pendientes");
  const [imprimir, setImprimir] = useState<Orden | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await api<{ rol: Rol; ordenes: Orden[] }>("lista", undefined, filtro === "pendientes" ? "&filtro=pendientes" : "");
      setOrdenes(res.ordenes);
      setError("");
    } catch (err) {
      if ((err as { status?: number }).status === 401) setRol(null);
      else setError((err as Error).message);
    }
    setCargando(false);
  }, [filtro]);

  useEffect(() => { api<{ rol: Rol | null }>("sesion").then((r) => setRol(r.rol)).catch((e) => { setRol(null); setError(e.message); }); }, []);
  // Se actualiza solo cada 30 s: un cliente puede registrarse en el mostrador mientras la pantalla está abierta.
  useEffect(() => {
    if (!rol) return;
    cargar();
    const t = setInterval(cargar, 30_000);
    return () => clearInterval(t);
  }, [rol, cargar]);
  useEffect(() => {
    if (!imprimir) return;
    const t = setTimeout(() => window.print(), 50);
    return () => clearTimeout(t);
  }, [imprimir]);

  const recibir = async (o: Orden) => {
    try {
      await api("recibir", { id: o.id });
      cargar();
    } catch (err) { setError((err as Error).message); }
  };

  return (
    <div className="min-h-[100svh] bg-[#050505]">
      <style>{ETIQUETA_CSS}</style>
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-8 md:px-8 md:pt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-2xl font-bold text-white">QUICK<span className="text-primary">FIX</span> <span className="font-normal text-white/50">· Taller</span></p>
          {rol && (
            <button onClick={async () => { await api("salir", {}); setRol(null); }} className={`${BTN} bg-white/[0.06] text-white/70 hover:bg-white/[0.12]`}>
              <LogOut className="h-5 w-5" aria-hidden="true" /> Salir
            </button>
          )}
        </div>

        {rol === undefined && <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-white/50" aria-label="Cargando" />}
        {rol === null && <Login onEntrar={setRol} />}

        {rol && (
          <>
            <div className="mt-8 flex flex-wrap gap-2">
              {(["pendientes", "todos"] as const).map((f) => (
                <button key={f} aria-pressed={filtro === f} onClick={() => setFiltro(f)}
                  className={`${BTN} ${filtro === f ? "bg-white text-black" : "bg-white/[0.06] text-white hover:bg-white/[0.12]"}`}>
                  {f === "pendientes" ? "Por recibir" : "Todos"}
                </button>
              ))}
              <button onClick={cargar} aria-label="Actualizar" className={`${BTN} bg-white/[0.06] px-4 text-white hover:bg-white/[0.12]`}>
                <RefreshCw className={`h-5 w-5 ${cargando ? "animate-spin" : ""}`} aria-hidden="true" />
              </button>
              <a href="/recepcion/" className={`${BTN} ml-auto bg-primary font-medium text-black hover:bg-[#ff7a1f]`}>
                <Plus className="h-5 w-5" aria-hidden="true" /> Registrar equipo
              </a>
            </div>
            {rol === "admin" && (
              <a href="/api/recepcion.php?accion=csv" className="mt-4 inline-flex items-center gap-2 text-base text-white/60 hover:text-white">
                <Download className="h-4 w-4" aria-hidden="true" /> Descargar todo para Excel
              </a>
            )}
            {error && <p role="alert" className="mt-6 rounded-2xl bg-red-500/15 px-5 py-4 text-red-200">{error}</p>}

            <div className="mt-6 space-y-4">
              {ordenes.length === 0 && !cargando && (
                <p className="rounded-3xl bg-white/[0.04] p-8 text-center text-lg text-white/60">
                  {filtro === "pendientes" ? "No hay equipos por recibir. Cuando un cliente se registre, aparece aquí solo." : "Todavía no hay equipos."}
                </p>
              )}
              {ordenes.map((o) => (
                <Tarjeta key={o.id} o={o} rol={rol} onRecibir={() => recibir(o)} onImprimir={() => setImprimir({ ...o })} />
              ))}
            </div>
          </>
        )}
      </main>
      {imprimir && <Etiquetas o={imprimir} />}
    </div>
  );
};

export default TallerPage;
