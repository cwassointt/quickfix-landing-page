import { Suspense, lazy, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, Check, Copy, Download, ListOrdered, Loader2, LogOut, MessageCircle, PanelLeft, Pencil, Phone, Plus, Printer, RefreshCw, Search, Trash2, UserPlus, X } from "lucide-react";

// Solo se descarga al imprimir: así el generador de QR no pesa en el resto de la web.
const ImprimirEtiquetas = lazy(() => import("@/components/EtiquetaImpresa").then((m) => ({ default: m.ImprimirEtiquetas })));
const InformeTecnico = lazy(() => import("@/components/InformeTecnico").then((m) => ({ default: m.InformeTecnico })));
const EditarCaso = lazy(() => import("@/components/EditarCaso").then((m) => ({ default: m.EditarCaso })));
import {
  API, COLOR_ESTADO, ESTADOS, aCsv, api, chatCliente, diaLima, equipo, estadoDe, etiquetas, fecha, mensajesCliente, nombreContacto, progreso, saludo, telefono, vcard, type Orden, type Rol,
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

/** Barra de progreso tipo envío: Recibido → En diagnóstico → Reparado (verde) o No reparado (rojo) → Entregado. */
function Progreso({ estado }: { estado: string }) {
  const { etapa, mal } = progreso(estado);
  const final = mal ? COLOR_ESTADO.no_reparado : COLOR_ESTADO.reparado;
  const pasos = ["Recibido", "En diagnóstico", etapa >= 3 ? (mal ? "No reparado" : "Reparado") : "Reparado o no", "Entregado"];
  // Los dos primeros pasos en naranja; desde el resultado, verde o rojo según cómo terminó.
  const color = (i: number) => (i >= 2 ? final : "hsl(var(--primary))");
  return (
    <ol className="mt-5 flex items-start" aria-label={`Progreso: ${ESTADOS[estadoDe(estado)]}`}>
      {pasos.map((p, i) => {
        const hecho = i < etapa;
        return (
          <li key={i} title={hecho ? `${p}: hecho` : `${p}: pendiente`} className="group relative flex flex-1 flex-col items-center text-center">
            {i < pasos.length - 1 && (
              <span aria-hidden="true" className="absolute left-1/2 top-4 h-1 w-full -translate-y-1/2 rounded-full transition-colors"
                style={{ background: i + 1 < etapa ? color(i + 1) : "rgba(255,255,255,0.1)" }} />
            )}
            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-transform duration-150 group-hover:scale-110"
              style={hecho
                ? { background: color(i), borderColor: color(i), color: "#000", boxShadow: i === etapa - 1 ? `0 0 0 4px ${i >= 2 ? final : "hsl(var(--primary))"}33` : undefined }
                : { background: "#111", borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.45)" }}>
              {hecho ? (i === 2 && mal ? <X className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />) : i + 1}
            </span>
            <span className={`mt-2 px-1 text-xs leading-tight transition-colors group-hover:text-white ${hecho ? "font-medium text-white" : "text-white/45"}`}
              style={hecho && i >= 2 ? { color: final } : undefined}>{p}</span>
          </li>
        );
      })}
    </ol>
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
    <article id={`caso-${o.id}`} className={`relative scroll-mt-6 overflow-hidden rounded-3xl p-5 pt-6 ring-1 transition-[background-color,box-shadow] duration-200 md:p-6 md:pt-7 ${pendiente ? "bg-[#251c21] ring-primary/40 hover:bg-[#2f1f20]" : "bg-[#111c2f] ring-white/[0.06] hover:bg-[#161f31] hover:ring-white/15"}`}>
      {/* Barra superior con el color del estado: se reconoce de un vistazo en qué va el caso. */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ background: COLOR_ESTADO[estadoDe(o.estado)] }} />
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <a href={`/taller/?qf=${o.id}`} className="font-mono text-3xl font-bold text-primary hover:underline">{o.numero}</a>
        <p className="flex items-center gap-2 text-sm text-white/60">
          <span className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold text-black" style={{ background: COLOR_ESTADO[estadoDe(o.estado)] }}>{ESTADOS[estadoDe(o.estado)]}</span>
          {fecha(o.creado)}{o.origen === "taller" ? " · registrado en el taller" : ""}
        </p>
      </div>
      <p className="mt-2 text-xl font-bold text-white">{o.nombre}</p>
      <p className="text-lg text-white/85">{o.tipo} · {equipo(o)}</p>
      {avisos.length > 0 && <p className="mt-2 text-base font-medium text-[#ff9b80]">⚠ {avisos.join(" · ")}</p>}
      <Progreso estado={o.estado} />
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
        {/* Imprime directo en la impresora de etiquetas (driver de Windows, papel 76 × 50 mm). El CSV queda para OpenLabel+. */}
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
function Seguimiento({ o, onCambio, onEstado }: { o: Orden; onCambio: () => void; onEstado: (estado: string) => void }) {
  const [monto, setMonto] = useState(o.presupuesto != null ? String(o.presupuesto) : "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const guardar = async (cambios: { estado?: string; presupuesto?: string }) => {
    // El estado se ve cambiado al instante en todo el tablero; si el servidor falla, se vuelve a leer lo guardado.
    if (cambios.estado) onEstado(cambios.estado);
    setGuardando(true);
    try { await api("actualizar", { id: o.id, ...cambios }); setError(""); onCambio(); }
    catch (err) { setError((err as Error).message); onCambio(); }
    setGuardando(false);
  };
  const presupuesto = monto.trim() ? Number(monto) : (o.presupuesto ?? null);
  return (
    <section className="mt-4 space-y-6 rounded-3xl bg-[#111c2f] p-5 md:p-6">
      <div>
        <h2 className="text-lg font-bold text-white">Estado</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(ESTADOS).map(([id, nombre]) => {
            const activo = estadoDe(o.estado) === id;
            return (
              <button key={id} aria-pressed={activo} onClick={() => guardar({ estado: id })}
                className={`${PRESS} inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-base disabled:opacity-60 ${activo ? "font-medium text-black" : "bg-white/[0.06] text-white hover:bg-white/[0.12]"}`}
                style={activo ? { background: COLOR_ESTADO[id] } : undefined}>
                {!activo && <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: COLOR_ESTADO[id] }} />}
                {nombre}
              </button>
            );
          })}
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
function Caso({ id, rol, onSalida, onCambio, onEstado, onVolver }: { id: number; rol: Rol; onSalida: () => void; onCambio: () => void; onEstado: (id: number, estado: string) => void; onVolver: () => void }) {
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
      <a href="/taller/" onClick={(e) => { e.preventDefault(); onVolver(); }} className="inline-flex items-center gap-2 text-base text-white/60 transition-colors hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Todos los equipos
      </a>
      {error && <p role="alert" className="mt-6 rounded-2xl bg-red-500/15 px-5 py-4 text-red-200">{error}</p>}
      {!o && !error && <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-white/50" aria-label="Cargando" />}
      {o && (
        <div className="mt-4">
          <Tarjeta o={o} rol={rol} onRecibir={async () => { await api("recibir", { id: o.id }); cargar(); onCambio(); }}
            onBorrar={async () => {
              try { await api("borrar", { id: o.id }); window.location.href = "/taller/"; }
              catch (err) { setError((err as Error).message); }
            }} onEditado={() => { cargar(); onCambio(); }} />
          {rol === "admin" && <Seguimiento key={String(o.presupuesto)} o={o} onCambio={() => { cargar(); onCambio(); }}
            onEstado={(estado) => { setO({ ...o, estado }); onEstado(o.id, estado); }} />}
          {rol === "admin" && <Suspense fallback={null}><InformeTecnico o={o} /></Suspense>}
        </div>
      )}
    </div>
  );
}

/** Grupos del tablero: "Entregado" junta también los que se devolvieron sin reparar. */
const GRUPOS = ["registrado", "recibido", "diagnostico", "reparado", "no_reparado", "entregado"];
const grupoDe = (estado: string) => { const e = estadoDe(estado); return e === "devuelto" ? "entregado" : e; };
const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
/** Busca por QF, cliente, equipo, serie o WhatsApp (sin tildes ni mayúsculas; el teléfono también sin espacios). */
const coincide = (o: Orden, q: string) => {
  const t = sinTildes(q.trim());
  return !t || sinTildes(`${o.numero} ${o.nombre} ${equipo(o)} ${o.serie} ${o.whatsapp}`).includes(t) || (/\d{3}/.test(t) && (o.whatsapp ?? "").replace(/\D/g, "").includes(t.replace(/\D/g, "")));
};

/** Fondo de plano (blueprint): cuadrícula fina cada 20 px y una más marcada cada 100 px sobre azul oscuro. */
const PLANO: CSSProperties = {
  backgroundColor: "#071226",
  backgroundImage: [
    "linear-gradient(rgba(96,165,250,0.16) 1px, transparent 1px)", "linear-gradient(90deg, rgba(96,165,250,0.16) 1px, transparent 1px)",
    "linear-gradient(rgba(96,165,250,0.06) 1px, transparent 1px)", "linear-gradient(90deg, rgba(96,165,250,0.06) 1px, transparent 1px)",
  ].join(", "),
  backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
  backgroundPosition: "-1px -1px",
  backgroundAttachment: "fixed",
};

/** Menú de la izquierda: todos los casos con el color de su estado, para ubicarlos rápido. */
function MenuCasos({ ordenes, actual, abierto, onAbrir, onCerrar }: { ordenes: Orden[]; actual: number | null; abierto: boolean; onAbrir: (id: number) => void; onCerrar: () => void }) {
  const [q, setQ] = useState("");
  const busca = q.trim();
  const lista = ordenes.filter((o) => coincide(o, q));
  return (
    <>
    {/* En pantallas chicas el menú es un cajón que se abre con el botón "Casos". */}
    {abierto && <div aria-hidden="true" onClick={onCerrar} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />}
    <aside className={`${abierto ? "fixed inset-y-0 left-0 z-40 flex shadow-2xl shadow-black" : "hidden"} h-[100svh] w-72 max-w-[85vw] shrink-0 flex-col border-r border-white/[0.08] bg-[#050d1c] lg:sticky lg:top-0 lg:z-auto lg:flex lg:shadow-none`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="px-1 text-sm font-medium text-white/50">Casos · {ordenes.length}</p>
          <button onClick={onCerrar} aria-label="Cerrar menú" className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white lg:hidden"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <label className="relative mt-3 block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, QF, modelo o celular" aria-label="Buscar caso"
            className="h-10 w-full rounded-xl bg-white/[0.06] pl-9 pr-3 text-sm text-white transition-colors placeholder:text-white/35 hover:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-primary" />
        </label>
      </div>
      <nav aria-label="Casos" className="flex-1 overflow-y-auto px-2 pb-4">
        {lista.length === 0 && <p className="px-3 py-2 text-sm text-white/45">{busca ? "Ningún caso coincide." : "Todavía no hay casos."}</p>}
        <ul className="space-y-0.5">
          {lista.map((o) => (
            <li key={o.id}>
              <a href={`/taller/?qf=${o.id}`} onClick={(e) => { e.preventDefault(); onAbrir(o.id); }} aria-current={actual === o.id ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${actual === o.id ? "bg-white/[0.1]" : "hover:bg-white/[0.06]"}`}>
                <span aria-hidden="true" className="h-9 w-1.5 shrink-0 rounded-full transition-transform group-hover:scale-y-110" style={{ background: COLOR_ESTADO[estadoDe(o.estado)] }} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium text-white">{o.nombre}</span>
                    <span className="shrink-0 font-mono text-xs text-white/45 transition-colors group-hover:text-primary">{o.numero}</span>
                  </span>
                  <span className="block truncate text-xs text-white/50">{ESTADOS[estadoDe(o.estado)]} · {equipo(o)}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
    </>
  );
}

/** Tablero del taller: menú de casos a la izquierda, contadores por estado y las tarjetas con su barra de progreso. */
const TallerPage = () => {
  const [rol, setRol] = useState<Rol | null | undefined>(undefined);
  const [caso, setCaso] = useState<number | null>(null);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [filtro, setFiltro] = useState("todos");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [menu, setMenu] = useState(false);
  const [buscar, setBuscar] = useState("");
  const buscador = useRef<HTMLInputElement>(null);
  // "/" lleva al buscador desde cualquier parte del tablero (salvo que ya estés escribiendo en un campo).
  useEffect(() => {
    const atajo = (e: KeyboardEvent) => {
      if (e.key !== "/" || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable) return;
      if (!buscador.current) return;
      e.preventDefault();
      buscador.current.focus();
    };
    window.addEventListener("keydown", atajo);
    return () => window.removeEventListener("keydown", atajo);
  }, []);

  // Siempre trae todos: el menú los necesita y el filtro de estado se aplica aquí.
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setOrdenes((await api<{ rol: Rol; ordenes: Orden[] }>("lista")).ordenes);
      setError("");
    } catch (err) {
      if ((err as { status?: number }).status === 401) setRol(null);
      else setError((err as Error).message);
    }
    setCargando(false);
  }, []);
  const salida = useCallback(() => setRol(null), []);

  // ?qf=7 viene del QR de la etiqueta (se lee aquí porque la página se pregenera sin la URL); atrás/adelante del navegador también lo cambia.
  const leerUrl = useCallback(() => {
    const qf = Number(new URLSearchParams(window.location.search).get("qf"));
    setCaso(qf > 0 ? qf : null);
  }, []);
  useEffect(() => {
    leerUrl();
    window.addEventListener("popstate", leerUrl);
    api<{ rol: Rol | null }>("sesion").then((r) => setRol(r.rol)).catch((e) => { setRol(null); setError(e.message); });
    return () => window.removeEventListener("popstate", leerUrl);
  }, [leerUrl]);
  const abrir = useCallback((id: number | null) => {
    setCaso(id);
    window.history.pushState(null, "", id ? `/taller/?qf=${id}` : "/taller/");
    window.scrollTo({ top: 0 });
  }, []);

  // La lista se actualiza sola cada 30 s: un cliente puede registrarse en el mostrador mientras la pantalla está abierta.
  useEffect(() => {
    if (!rol) return;
    cargar();
    const t = setInterval(cargar, 30_000);
    return () => clearInterval(t);
  }, [rol, cargar]);

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

  const contadores = [
    { id: "todos", nombre: "Todos", n: ordenes.length, color: "#ffffff" },
    ...GRUPOS.map((g) => ({ id: g, nombre: g === "entregado" ? "Entregados" : ESTADOS[g], n: ordenes.filter((o) => grupoDe(o.estado) === g).length, color: COLOR_ESTADO[g] })),
  ];
  const visibles = ordenes.filter((o) => (filtro === "todos" || grupoDe(o.estado) === filtro) && coincide(o, buscar));

  return (
    <div className="min-h-[100svh] lg:flex" style={PLANO}>
      {rol && <MenuCasos ordenes={ordenes} actual={caso} abierto={menu} onAbrir={(id) => { setMenu(false); abrir(id); }} onCerrar={() => setMenu(false)} />}
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-24 pt-8 md:px-8 md:pt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <a href="/taller/" onClick={(e) => { if (rol) { e.preventDefault(); abrir(null); } }} className="text-2xl font-bold text-white transition-opacity hover:opacity-80">QUICK<span className="text-primary">FIX</span> <span className="font-normal text-white/50">· Taller</span></a>
          {rol && (
            <span className="flex gap-2">
            <button onClick={() => setMenu(true)} className={`${BTN} bg-white/[0.06] px-4 text-white hover:bg-white/[0.12] lg:hidden`}>
              <PanelLeft className="h-5 w-5" aria-hidden="true" /> Casos
            </button>
            <button onClick={async () => { await api("salir", {}); setRol(null); }} className={`${BTN} bg-white/[0.06] text-white/70 hover:bg-white/[0.12] hover:text-white`}>
              <LogOut className="h-5 w-5" aria-hidden="true" /> Salir
            </button>
            </span>
          )}
        </div>

        {rol === undefined && <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-white/50" aria-label="Cargando" />}
        {rol === null && <Login onEntrar={setRol} />}

        {rol && caso && <Caso key={caso} id={caso} rol={rol} onSalida={salida} onCambio={cargar} onVolver={() => abrir(null)}
          onEstado={(id, estado) => setOrdenes((os) => os.map((x) => (x.id === id ? { ...x, estado } : x)))} />}

        {rol && !caso && (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <h1 className="mr-auto text-xl font-bold text-white">Tablero</h1>
              {rol === "admin" && (
                <>
                  <a href="/api/recepcion.php?accion=csv" title="Descargar todo para Excel" className={`${BTN} px-4 text-white/60 hover:bg-white/[0.08] hover:text-white`}>
                    <Download className="h-5 w-5" aria-hidden="true" /> <span className="hidden sm:inline">Excel</span>
                  </a>
                  <button onClick={renumerar} title="Renumerar desde QF-0001" className={`${BTN} px-4 text-white/60 hover:bg-white/[0.08] hover:text-white`}>
                    <ListOrdered className="h-5 w-5" aria-hidden="true" /> <span className="hidden sm:inline">Renumerar</span>
                  </button>
                </>
              )}
              <button onClick={cargar} aria-label="Actualizar" title="Actualizar" className={`${BTN} bg-white/[0.06] px-4 text-white hover:bg-white/[0.12]`}>
                <RefreshCw className={`h-5 w-5 ${cargando ? "animate-spin" : ""}`} aria-hidden="true" />
              </button>
              <a href="/recepcion/" className={`${BTN} bg-primary font-medium text-black hover:bg-[#ff7a1f]`}>
                <Plus className="h-5 w-5" aria-hidden="true" /> Registrar equipo
              </a>
            </div>

            <label className="relative mt-6 block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" aria-hidden="true" />
              <input ref={buscador} type="search" value={buscar} onChange={(e) => setBuscar(e.target.value)} onKeyDown={(e) => e.key === "Escape" && setBuscar("")}
                placeholder="Buscar por nombre, QF, modelo, serie o celular" aria-label="Buscar casos"
                className="h-14 w-full rounded-2xl bg-[#111c2f] pl-12 pr-14 text-base text-white ring-1 ring-white/[0.08] transition-[box-shadow,background-color] placeholder:text-white/40 hover:bg-[#161f31] hover:ring-white/20 focus:outline-none focus:ring-2 focus:ring-primary" />
              <kbd aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/15 px-2 py-0.5 font-mono text-xs text-white/45 sm:block">/</kbd>
            </label>
            {buscar.trim() && <p role="status" className="mt-2 px-1 text-sm text-white/55">{visibles.length} {visibles.length === 1 ? "caso encontrado" : "casos encontrados"}{filtro !== "todos" ? " en este estado" : ""}</p>}

            {/* Contadores por estado: cada uno filtra las tarjetas de abajo. */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
              {contadores.map((c) => (
                <button key={c.id} aria-pressed={filtro === c.id} onClick={() => setFiltro(c.id)}
                  className={`${PRESS} relative overflow-hidden rounded-2xl p-4 pt-5 text-left ring-1 hover:-translate-y-0.5 ${filtro === c.id ? "bg-[#202a3c] ring-white/30" : "bg-[#111c2f] ring-white/[0.06] hover:bg-[#1b2537]"}`}>
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: c.color }} />
                  <span className="block text-3xl font-bold tabular-nums text-white">{c.n}</span>
                  <span className="mt-1 block text-sm leading-tight text-white/60">{c.nombre}</span>
                </button>
              ))}
            </div>

            {aviso && <p role="status" className="mt-4 rounded-2xl bg-primary/[0.12] px-5 py-3 text-white">{aviso}</p>}
            {error && <p role="alert" className="mt-6 rounded-2xl bg-red-500/15 px-5 py-4 text-red-200">{error}</p>}

            <div className="mt-6 grid gap-4 2xl:grid-cols-2">
              {visibles.length === 0 && !cargando && (
                <p className="rounded-3xl bg-[#111c2f] p-8 text-center text-lg text-white/60 2xl:col-span-2">
                  {filtro === "registrado" ? "No hay equipos por recibir. Cuando un cliente se registre, aparece aquí solo." : buscar.trim() ? "Ningún caso coincide con la búsqueda." : ordenes.length ? "No hay casos en este estado." : "Todavía no hay equipos."}
                </p>
              )}
              {visibles.map((o) => (
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
