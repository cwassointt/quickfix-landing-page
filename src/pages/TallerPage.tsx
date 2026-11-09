import { useCallback, useEffect, useState } from "react";
import { Download, Loader2, LogOut, Plus, Printer, RefreshCw } from "lucide-react";
import { ESTADOS, api, chatCliente, equipo, fecha, type Orden, type Rol } from "@/lib/recepcion";

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

const Etiquetas = ({ o }: { o: Orden }) => (
  <div className="qf-etiquetas hidden" aria-hidden="true">
    {["EQUIPO", "CARGADOR"].map((parte) => (
      <div key={parte} className="qf-etiqueta" style={{ fontSize: "7pt", lineHeight: 1.2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
          <span>QUICKFIX</span><span>{parte}</span>
        </div>
        <div style={{ fontSize: "17pt", fontWeight: 700, lineHeight: 1.1, margin: "0.8mm 0" }}>{o.numero}</div>
        <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden" }}>{o.nombre}</div>
        <div style={{ whiteSpace: "nowrap", overflow: "hidden" }}>{equipo(o)}</div>
        <div style={{ whiteSpace: "nowrap", overflow: "hidden" }}>S/N {o.serie || "—"} · {new Date(o.creado).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" })}</div>
      </div>
    ))}
  </div>
);

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
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Dato k="N° de serie" v={o.serie} />
        <Dato k="Deja también" v={o.accesorios} />
        <Dato k="Servicio" v={o.servicio} />
        {rol === "admin" && <><Dato k="WhatsApp" v={o.whatsapp} /><Dato k="DNI" v={o.dni} /><Dato k="Correo" v={o.correo} /><Dato k="Distrito" v={o.distrito} /><Dato k="Clave del equipo" v={o.pin} /><Dato k="Nos conoció por" v={o.como} /></>}
      </dl>
      <p className="mt-4 whitespace-pre-line rounded-2xl bg-black/30 p-4 text-base text-white/85">{o.falla}</p>
      {o.recibido && <p className="mt-3 text-sm text-white/50">Recibido {fecha(o.recibido)} · {o.recibido_por === "mostrador" ? "mostrador" : "tú"}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        {pendiente ? (
          <button onClick={onRecibir} className={`${BTN} bg-primary font-medium text-black hover:bg-[#ff7a1f]`}>
            <Printer className="h-5 w-5" aria-hidden="true" /> Recibido · imprimir etiquetas
          </button>
        ) : (
          <button onClick={onImprimir} className={`${BTN} bg-white/[0.08] text-white hover:bg-white/[0.14]`}>
            <Printer className="h-5 w-5" aria-hidden="true" /> Etiquetas
          </button>
        )}
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
      setImprimir({ ...o });
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
