import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, Copy, Download, ListOrdered, Loader2, LogOut, MessageCircle, Pencil, Phone, Plus, Printer, RefreshCw, Trash2, UserPlus } from "lucide-react";

// Solo se descarga al imprimir: así el generador de QR no pesa en el resto de la web.
const ImprimirEtiquetas = lazy(() => import("@/components/EtiquetaImpresa").then((m) => ({ default: m.ImprimirEtiquetas })));
const EditarCaso = lazy(() => import("@/components/EditarCaso").then((m) => ({ default: m.EditarCaso })));
import {
  API, ESTADOS, aCsv, api, chatCliente, diaLima, equipo, etiquetas, fecha, mensajesCliente, nombreContacto, saludo, telefono, vcard, type Orden, type Rol,
} from "@/lib/recepcion";

const PRESS = "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";
const BTN = `${PRESS} inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base`;
const SUAVE = `${BTN} bg-white/[0.08] text-white hover:bg-white/[0.14]`;

function descargar(texto: string, tipo: string, archivo: string) {
  const url = URL.createObjectURL(new Blob([texto], { type: `${tipo};charset=utf-8` }));
  const a = Object.assign(document.createElement("a"), { href: url, download: archivo });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Baja las etiquetas como CSV para imprimirlas desde OpenLabel+ (plantilla "QuickFix", con QR a la columna URL). */
const descargarCsv = (o: Orden) => descargar(aCsv(etiquetas(o)), "text/csv", `etiqueta-${o.numero}.csv`);

/** Nombre para agendar + botón que lo copia. */
function Contacto({ o }: { o: Orden }) {
  const nombre = nombreContacto(o);
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-black/30 px-4 py-3">
      <span className="w-full text-sm text-white/50">Agendar como</span>
      <span className="flex-1 font-medium text-white">{nombre}</span>
      <button onClick={async () => { try { await navigator.clipboard.writeText(nombre); setCopiado(true); setTimeout(() => setCopiado(false), 1500); } catch { /* sin permiso: queda visible para copiar a mano */ } }}
        className={`${PRESS} inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/75 hover:bg-white/[0.08]`}>
        {copiado ? <Check className="h-4 w-4 text-primary" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />} {copiado ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

/** tel: con código de país para celulares peruanos. */
const enlaceLlamada = (v: string) => {
  const d = v.replace(/\D/g, "");
  return `tel:+${d.length === 9 ? `51${d}` : d}`;
};

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

function Tarjeta({ o, rol, onRecibir, onBorrar, onEditado }: { o: Orden; rol: Rol; onRecibir: () => void; onBorrar: () => void; onEditado: () => void }) {
  const pendiente = o.estado === "registrado";
  const hoy = diaLima();
  const avisos = [o.liquido === 1 && "Se mojó", o.abierto === 1 && "Otro técnico ya lo abrió"].filter(Boolean) as string[];
  const [imprimir, setImprimir] = useState(false);
  const cerrar = useCallback(() => setImprimir(false), []);
  const [editar, setEditar] = useState(false);
  const cerrarEditar = useCallback(() => setEditar(false), []);
  return (
    <article className={`rounded-3xl p-5 md:p-6 ${pendiente ? "bg-primary/[0.12] ring-1 ring-primary/40" : "bg-white/[0.04]"}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <a href={`/taller/?qf=${o.id}`} className="font-mono text-3xl font-bold text-primary hover:underline">{o.numero}</a>
        <p className="text-sm text-white/60">{ESTADOS[o.estado] ?? o.estado} · {fecha(o.creado)}{o.origen === "taller" ? " · registrado en el taller" : ""}</p>
      </div>
      <p className="mt-2 text-xl font-bold text-white">{o.nombre}</p>
      <p className="text-lg text-white/85">{o.tipo} · {equipo(o)}</p>
      {avisos.length > 0 && <p className="mt-2 text-base font-medium text-[#ff9b80]">⚠ {avisos.join(" · ")}</p>}
      {pendiente && (o.llega || o.modo === "recojo") && (
        <p className="mt-3 rounded-2xl bg-black/30 px-4 py-3 text-base text-white">
          {o.modo === "recojo" ? <><span className="font-medium text-primary">Recojo en casa</span> · {o.direccion}{o.distrito ? `, ${o.distrito}` : ""}</> : "Lo trae al taller"}
          {o.llega && ` · ${o.llega === hoy ? "hoy" : new Date(`${o.llega}T12:00`).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "short" })}`}
        </p>
      )}
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Dato k="WhatsApp" v={o.whatsapp && telefono(o.whatsapp)} />
        <Dato k="N° de serie" v={o.serie} />
        <Dato k="Deja también" v={o.accesorios} />
        <Dato k="Servicio" v={o.servicio} />
        {rol === "admin" && <><Dato k="DNI" v={o.dni} /><Dato k="Correo" v={o.correo} /><Dato k="Distrito" v={o.distrito} /><Dato k="Clave del equipo" v={o.pin} /><Dato k="Nos conoció por" v={o.como} />
          <Dato k="Reparar sin consultar" v={o.autoriza ? `Hasta S/ ${o.autoriza}` : "No, consultar antes"} />
          <Dato k="Presupuesto" v={o.presupuesto != null ? `S/ ${o.presupuesto}` : null} /></>}
      </dl>
      {o.foto === 1 && (
        <a href={`${API}?accion=foto&id=${o.id}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
          <img src={`${API}?accion=foto&id=${o.id}`} alt={`Etiqueta de ${o.numero}`} loading="lazy" className="h-24 rounded-xl object-cover" />
        </a>
      )}
      {rol === "admin" && o.whatsapp && <Contacto o={o} />}
      <p className="mt-4 whitespace-pre-line rounded-2xl bg-black/30 p-4 text-base text-white/85">{o.falla}</p>
      {o.recibido && <p className="mt-3 text-sm text-white/50">Recibido {fecha(o.recibido)} · {o.recibido_por === "mostrador" ? "mostrador" : "tú"}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        {/* Imprime directo en la impresora de etiquetas (driver de Windows, papel 50 × 30 mm). El CSV queda para OpenLabel+. */}
        {pendiente ? (
          <button onClick={() => { onRecibir(); setImprimir(true); }} className={`${BTN} bg-primary font-medium text-black hover:bg-[#ff7a1f]`}>
            <Check className="h-5 w-5" aria-hidden="true" /> Recibido · imprimir etiquetas
          </button>
        ) : (
          <button onClick={() => setImprimir(true)} className={SUAVE}>
            <Printer className="h-5 w-5" aria-hidden="true" /> Imprimir etiquetas
          </button>
        )}
        <button onClick={() => descargarCsv(o)} aria-label="Bajar etiquetas en CSV para OpenLabel+" title="CSV para OpenLabel+" className={`${SUAVE} px-4`}>
          <Download className="h-5 w-5" aria-hidden="true" />
        </button>
        {imprimir && <Suspense fallback={null}><ImprimirEtiquetas o={o} onCerrar={cerrar} /></Suspense>}
        {rol === "admin" && o.whatsapp && (
          <>
            <a href={chatCliente(o.whatsapp, saludo(o))} target="_blank" rel="noopener noreferrer" className={SUAVE}>
              <MessageCircle className="h-5 w-5" aria-hidden="true" /> WhatsApp
            </a>
            <a href={enlaceLlamada(o.whatsapp)} className={SUAVE}><Phone className="h-5 w-5" aria-hidden="true" /> Llamar</a>
            <button onClick={() => descargar(vcard(o), "text/vcard", `${o.numero}.vcf`)} className={SUAVE}>
              <UserPlus className="h-5 w-5" aria-hidden="true" /> Agendar
            </button>
          </>
        )}
        {rol === "admin" && (
          <span className="ml-auto flex gap-1">
            <button onClick={() => setEditar(true)} className={`${BTN} px-4 text-white/75 hover:bg-white/[0.08]`}>
              <Pencil className="h-5 w-5" aria-hidden="true" /> Editar
            </button>
            <button onClick={() => { if (confirm(`¿Borrar ${o.numero} de ${o.nombre}? No se puede deshacer.`)) onBorrar(); }}
              className={`${BTN} px-4 text-[#ff9b80] hover:bg-red-500/15`}>
              <Trash2 className="h-5 w-5" aria-hidden="true" /> Borrar
            </button>
          </span>
        )}
        {editar && <Suspense fallback={null}><EditarCaso o={o} onCerrar={cerrarEditar} onGuardado={onEditado} /></Suspense>}
      </div>
    </article>
  );
}

/** Solo admin: estado, presupuesto y mensajes de WhatsApp ya escritos para el seguimiento. */
function Seguimiento({ o, onCambio }: { o: Orden; onCambio: () => void }) {
  const [monto, setMonto] = useState(o.presupuesto != null ? String(o.presupuesto) : "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const guardar = async (cambios: { estado?: string; presupuesto?: string }) => {
    setGuardando(true);
    try { await api("actualizar", { id: o.id, ...cambios }); setError(""); onCambio(); }
    catch (err) { setError((err as Error).message); }
    setGuardando(false);
  };
  const presupuesto = monto.trim() ? Number(monto) : (o.presupuesto ?? null);
  return (
    <section className="mt-4 space-y-6 rounded-3xl bg-white/[0.04] p-5 md:p-6">
      <div>
        <h2 className="text-lg font-bold text-white">Estado</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(ESTADOS).map(([id, nombre]) => (
            <button key={id} disabled={guardando} aria-pressed={o.estado === id} onClick={() => guardar({ estado: id })}
              className={`${PRESS} rounded-full px-4 py-2.5 text-base disabled:opacity-60 ${o.estado === id ? "bg-primary text-black" : "bg-white/[0.06] text-white hover:bg-white/[0.12]"}`}>
              {nombre}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">Presupuesto</h2>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); guardar({ presupuesto: monto }); }}>
          <span className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">S/</span>
            <input inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value.replace(/[^\d.]/g, ""))} aria-label="Presupuesto en soles"
              className="h-12 w-full rounded-xl bg-white/[0.06] pl-11 pr-4 text-base text-white focus:outline-none focus:ring-2 focus:ring-primary" />
          </span>
          <button disabled={guardando} className={`${BTN} bg-white text-black hover:bg-white/90 disabled:opacity-60`}>Guardar</button>
        </form>
      </div>
      {o.whatsapp && (
        <div>
          <h2 className="text-lg font-bold text-white">Escribirle por WhatsApp</h2>
          <p className="mt-1 text-sm text-white/55">Se abre el chat con el mensaje listo; lo revisas y lo envías.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {mensajesCliente(o, presupuesto).map((m) => (
              <a key={m.id} href={chatCliente(o.whatsapp, m.texto)} target="_blank" rel="noopener noreferrer"
                className={`${PRESS} rounded-2xl bg-white/[0.06] px-4 py-3 text-left hover:bg-white/[0.12]`}>
                <span className="flex items-center gap-2 text-base font-medium text-white"><MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" /> {m.titulo}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-white/55">{m.texto}</span>
              </a>
            ))}
          </div>
        </div>
      )}
      {error && <p role="alert" className="text-[#ff9b80]">{error}</p>}
    </section>
  );
}

/** Lo que abre el QR de la etiqueta: un solo equipo, con el seguimiento si eres admin. */
function Caso({ id, rol, onSalida }: { id: number; rol: Rol; onSalida: () => void }) {
  const [o, setO] = useState<Orden | null>(null);
  const [error, setError] = useState("");
  const cargar = useCallback(async () => {
    try { setO((await api<{ orden: Orden }>("orden", undefined, `&id=${id}`)).orden); setError(""); }
    catch (err) {
      if ((err as { status?: number }).status === 401) onSalida();
      else setError((err as Error).message);
    }
  }, [id, onSalida]);
  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div className="mt-8">
      <a href="/taller/" className="inline-flex items-center gap-2 text-base text-white/60 hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Todos los equipos
      </a>
      {error && <p role="alert" className="mt-6 rounded-2xl bg-red-500/15 px-5 py-4 text-red-200">{error}</p>}
      {!o && !error && <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-white/50" aria-label="Cargando" />}
      {o && (
        <div className="mt-4">
          <Tarjeta o={o} rol={rol} onRecibir={async () => { await api("recibir", { id: o.id }); cargar(); }}
            onBorrar={async () => {
              try { await api("borrar", { id: o.id }); window.location.href = "/taller/"; }
              catch (err) { setError((err as Error).message); }
            }} onEditado={cargar} />
          {rol === "admin" && <Seguimiento key={`${o.estado}-${o.presupuesto}`} o={o} onCambio={cargar} />}
        </div>
      )}
    </div>
  );
}

/** Pantalla del taller: tus padres reciben equipos y bajan las etiquetas; tú ves todo y haces el seguimiento. */
const TallerPage = () => {
  const [rol, setRol] = useState<Rol | null | undefined>(undefined);
  const [caso, setCaso] = useState<number | null>(null);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [filtro, setFiltro] = useState<"pendientes" | "todos">("pendientes");
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
  const salida = useCallback(() => setRol(null), []);

  useEffect(() => {
    // ?qf=7 viene del QR de la etiqueta (se lee aquí porque la página se pregenera sin la URL).
    const qf = Number(new URLSearchParams(window.location.search).get("qf"));
    if (qf > 0) setCaso(qf);
    api<{ rol: Rol | null }>("sesion").then((r) => setRol(r.rol)).catch((e) => { setRol(null); setError(e.message); });
  }, []);
  // La lista se actualiza sola cada 30 s: un cliente puede registrarse en el mostrador mientras la pantalla está abierta.
  useEffect(() => {
    if (!rol || caso) return;
    cargar();
    const t = setInterval(cargar, 30_000);
    return () => clearInterval(t);
  }, [rol, caso, cargar]);

  const [aviso, setAviso] = useState("");
  const renumerar = async () => {
    if (!confirm("Los casos que quedan se numeran otra vez desde QF-0001, en el mismo orden.\n\nBorra antes los de prueba. Los que cambien de número necesitan etiqueta nueva (su QR cambia). ¿Seguir?")) return;
    try {
      const { cambios } = await api<{ cambios: number }>("renumerar", {});
      setAviso(cambios ? `Listo: ${cambios} caso(s) cambiaron de número. Vuelve a imprimir sus etiquetas.` : "Ya estaban en orden desde QF-0001.");
      cargar();
    } catch (err) { setError((err as Error).message); }
  };

  const enviar = async (accion: "recibir" | "borrar", o: Orden) => {
    try {
      await api(accion, { id: o.id });
      cargar();
    } catch (err) { setError((err as Error).message); }
  };

  return (
    <div className="min-h-[100svh] bg-[#050505]">
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-8 md:px-8 md:pt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <a href="/taller/" className="text-2xl font-bold text-white">QUICK<span className="text-primary">FIX</span> <span className="font-normal text-white/50">· Taller</span></a>
          {rol && (
            <button onClick={async () => { await api("salir", {}); setRol(null); }} className={`${BTN} bg-white/[0.06] text-white/70 hover:bg-white/[0.12]`}>
              <LogOut className="h-5 w-5" aria-hidden="true" /> Salir
            </button>
          )}
        </div>

        {rol === undefined && <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-white/50" aria-label="Cargando" />}
        {rol === null && <Login onEntrar={setRol} />}

        {rol && caso && <Caso id={caso} rol={rol} onSalida={salida} />}

        {rol && !caso && (
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
            {rol === "admin" && (
              <button onClick={renumerar} className="ml-5 mt-4 inline-flex items-center gap-2 text-base text-white/60 hover:text-white">
                <ListOrdered className="h-4 w-4" aria-hidden="true" /> Renumerar desde QF-0001
              </button>
            )}
            {aviso && <p role="status" className="mt-4 rounded-2xl bg-primary/[0.12] px-5 py-3 text-white">{aviso}</p>}
            {error && <p role="alert" className="mt-6 rounded-2xl bg-red-500/15 px-5 py-4 text-red-200">{error}</p>}

            <div className="mt-6 space-y-4">
              {ordenes.length === 0 && !cargando && (
                <p className="rounded-3xl bg-white/[0.04] p-8 text-center text-lg text-white/60">
                  {filtro === "pendientes" ? "No hay equipos por recibir. Cuando un cliente se registre, aparece aquí solo." : "Todavía no hay equipos."}
                </p>
              )}
              {ordenes.map((o) => (
                <Tarjeta key={o.id} o={o} rol={rol} onRecibir={() => enviar("recibir", o)} onBorrar={() => enviar("borrar", o)} onEditado={cargar} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TallerPage;
