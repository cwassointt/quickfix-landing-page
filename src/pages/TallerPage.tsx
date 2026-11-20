import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Camera, Check, ChevronDown, ChevronRight, CircuitBoard, Copy, Download, ExternalLink, Link2, ListOrdered, Loader2, LogOut, MessageCircle,
  MoreHorizontal, PanelLeft, Pencil, Phone, Plus, Printer, RefreshCw, Search, Trash2, UserPlus, X,
} from "lucide-react";

// Solo se descarga al imprimir: así el generador de QR no pesa en el resto de la web.
const ImprimirEtiquetas = lazy(() => import("@/components/EtiquetaImpresa").then((m) => ({ default: m.ImprimirEtiquetas })));
const InformeTecnico = lazy(() => import("@/components/InformeTecnico").then((m) => ({ default: m.InformeTecnico })));
const EditarCaso = lazy(() => import("@/components/EditarCaso").then((m) => ({ default: m.EditarCaso })));
import { Progreso } from "@/components/Progreso";
import {
  API, COLOR_ESTADO, ESTADOS, MENSAJE_DE, PASOS, aCsv, api, atrasado, chatCliente, destinoEstado, diaLima, diasEnEstado, equipo, estadoDe, etiquetas,
  faltaCotizar, fecha, mensajesCliente, nombreContacto, reducirFoto, saludo, telefono, urlSeguimiento, vcard,
  type Orden, type Paso, type Resumen, type Rol,
} from "@/lib/recepcion";

// Mismo lenguaje visual que la web: negro #050505, tarjetas apenas más claras, naranja para lo principal.
const PRESS = "transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";
const BTN = `${PRESS} inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base`;
const SUAVE = `${BTN} bg-white/[0.07] text-white hover:bg-white/[0.13]`;
const PRINCIPAL = `${BTN} bg-primary font-medium text-black hover:bg-[#ff7a1f] hover:shadow-lg hover:shadow-primary/20`;
const MENU = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-base text-white transition-colors hover:bg-white/[0.08] focus-visible:bg-white/[0.08] focus-visible:outline-none";
const CARD = "rounded-3xl bg-white/[0.035] ring-1 ring-white/[0.07]";
const CAMPO = "h-12 w-full rounded-xl bg-white/[0.06] text-base text-white ring-1 ring-white/[0.06] transition-[box-shadow,background-color] placeholder:text-white/35 hover:bg-white/[0.09] hover:ring-white/15 focus:outline-none focus:ring-2 focus:ring-primary";
const TITULO = "font-display text-lg font-bold tracking-[-0.01em] text-white";

function descargar(texto: string, tipo: string, archivo: string) {
  const url = URL.createObjectURL(new Blob([texto], { type: `${tipo};charset=utf-8` }));
  const a = Object.assign(document.createElement("a"), { href: url, download: archivo });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Baja las etiquetas como CSV para imprimirlas desde OpenLabel+ (plantilla "QuickFix", con QR a la columna URL). */
const descargarCsv = (o: Orden) => descargar(aCsv(etiquetas(o)), "text/csv", `etiqueta-${o.numero}.csv`);

/** Copia al portapapeles y avisa un momento; sin permiso el texto queda visible para copiarlo a mano. */
function useCopiar() {
  const [copiado, setCopiado] = useState(false);
  const copiar = async (texto: string) => {
    try { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 1500); } catch { /* sin permiso */ }
  };
  return [copiado, copiar] as const;
}

/** Nombre para agendar + botón que lo copia. */
function Contacto({ o }: { o: Orden }) {
  const nombre = nombreContacto(o);
  const [copiado, copiar] = useCopiar();
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-black/40 px-4 py-3">
      <span className="w-full text-sm text-white/50">Agendar como</span>
      <span className="flex-1 font-medium text-white">{nombre}</span>
      <button onClick={() => copiar(nombre)} className={`${PRESS} inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/75 hover:bg-white/[0.08] hover:text-white`}>
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
      className={`${CARD} mx-auto mt-16 max-w-sm space-y-5 p-6 md:p-8`}
      onSubmit={async (e) => {
        e.preventDefault();
        setCargando(true);
        try { onEntrar((await api<{ rol: Rol }>("entrar", { clave })).rol); }
        catch (err) { setError((err as Error).message); }
        setCargando(false);
      }}
    >
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-white">Entrar al taller</h1>
        <p className="mt-1 text-sm text-white/55">Solo para el equipo de QuickFix.</p>
      </div>
      <label className="block text-base text-white">
        Clave del taller
        <input type="password" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} autoFocus className={`${CAMPO} mt-2 px-4`} />
      </label>
      {error && <p role="alert" className="text-[#ff9b80]">{error}</p>}
      <button disabled={cargando || !clave} className={`${PRINCIPAL} w-full disabled:opacity-60`}>
        {cargando && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />} Entrar
      </button>
    </form>
  );
}

/** Píldora con el color del estado. */
const Chip = ({ estado }: { estado: string }) => (
  <span className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold text-black" style={{ background: COLOR_ESTADO[estadoDe(estado)] }}>{ESTADOS[estadoDe(estado)]}</span>
);
const Alerta = ({ children }: { children: string }) => (
  <span className="whitespace-nowrap rounded-full bg-[#fb7185]/15 px-2.5 py-0.5 text-xs font-bold text-[#fda4af] ring-1 ring-[#fb7185]/40">{children}</span>
);

const Dato = ({ k, v }: { k: string; v: string | null | undefined }) =>
  v ? <div><dt className="text-sm text-white/50">{k}</dt><dd className="text-base text-white">{v}</dd></div> : null;

function Tarjeta({ o, rol, imprimirAlAbrir = false, onRecibir, onBorrar, onEditado }: { o: Orden; rol: Rol; imprimirAlAbrir?: boolean; onRecibir: () => void; onBorrar: () => void; onEditado: () => void }) {
  const pendiente = o.estado === "registrado";
  const hoy = diaLima();
  const avisos = [o.liquido === 1 && "Se mojó", o.abierto === 1 && "Otro técnico ya lo abrió"].filter(Boolean) as string[];
  const [imprimir, setImprimir] = useState(imprimirAlAbrir);
  const cerrar = useCallback(() => setImprimir(false), []);
  const [editar, setEditar] = useState(false);
  const cerrarEditar = useCallback(() => setEditar(false), []);
  return (
    <article className={`relative overflow-hidden p-5 pt-7 md:p-7 md:pt-8 ${CARD} ${pendiente ? "bg-primary/[0.08] ring-primary/40" : ""}`}>
      {/* Barra superior con el color del estado: se reconoce de un vistazo en qué va el caso. */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ background: COLOR_ESTADO[estadoDe(o.estado)] }} />
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 className="font-mono text-3xl font-bold tracking-tight text-primary md:text-4xl">{o.numero}</h1>
        <p className="flex flex-wrap items-center gap-2 text-sm text-white/55">
          <Chip estado={o.estado} />
          {fecha(o.creado)}{o.origen === "taller" ? " · registrado en el taller" : ""}
        </p>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-[-0.02em] text-white">{o.nombre}</p>
      <p className="text-lg text-white/75">{o.tipo} · {equipo(o)}</p>
      {avisos.length > 0 && <p className="mt-2 text-base font-medium text-[#ff9b80]">⚠ {avisos.join(" · ")}</p>}
      <Progreso estado={o.estado} />
      {pendiente && (o.llega || o.modo === "recojo") && (
        <p className="mt-4 rounded-2xl bg-black/40 px-4 py-3 text-base text-white">
          {o.modo === "recojo" ? <><span className="font-medium text-primary">Recojo en casa</span> · {o.direccion}{o.distrito ? `, ${o.distrito}` : ""}</> : "Lo trae al taller"}
          {o.llega && ` · ${o.llega === hoy ? "hoy" : new Date(`${o.llega}T12:00`).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "short" })}`}
        </p>
      )}
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <Dato k="WhatsApp" v={o.whatsapp && telefono(o.whatsapp)} />
        <Dato k="N° de serie" v={o.serie} />
        <Dato k="Deja también" v={o.accesorios} />
        <Dato k="Servicio" v={o.servicio} />
        {rol === "admin" && <><Dato k="DNI" v={o.dni} /><Dato k="Correo" v={o.correo} /><Dato k="Distrito" v={o.distrito} /><Dato k="Clave del equipo" v={o.pin} /><Dato k="Nos conoció por" v={o.como} />
          <Dato k="Reparar sin consultar" v={o.autoriza ? `Hasta S/ ${o.autoriza}` : "No, consultar antes"} />
          <Dato k="Presupuesto" v={o.presupuesto != null ? `S/ ${o.presupuesto}` : null} />
          <Dato k="Reemplazo de placa" v={o.placa != null ? `S/ ${o.placa}` : null} /></>}
      </dl>
      {o.foto === 1 && (
        <a href={`${API}?accion=foto&id=${o.id}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block overflow-hidden rounded-xl ring-1 ring-white/10 transition hover:ring-white/30">
          <img src={`${API}?accion=foto&id=${o.id}`} alt={`Etiqueta de ${o.numero}`} loading="lazy" className="h-24 object-cover" />
        </a>
      )}
      {rol === "admin" && o.whatsapp && <Contacto o={o} />}
      <p className="mt-4 whitespace-pre-line rounded-2xl bg-black/40 p-4 text-base text-white/85">{o.falla}</p>
      {o.recibido && <p className="mt-3 text-sm text-white/50">Recibido {fecha(o.recibido)} · {o.recibido_por === "mostrador" ? "mostrador" : "tú"}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        {/* Imprime directo en la impresora de etiquetas (driver de Windows, papel 76 × 50 mm). El CSV queda para OpenLabel+. */}
        {pendiente ? (
          <button onClick={() => { onRecibir(); setImprimir(true); }} className={PRINCIPAL}>
            <Check className="h-5 w-5" aria-hidden="true" /> Recibido · imprimir etiquetas
          </button>
        ) : (
          <button onClick={() => setImprimir(true)} className={SUAVE}>
            <Printer className="h-5 w-5" aria-hidden="true" /> Imprimir etiquetas
          </button>
        )}
        {imprimir && <Suspense fallback={null}><ImprimirEtiquetas o={o} onCerrar={cerrar} /></Suspense>}
        {rol === "admin" && o.whatsapp && (
          <>
            <a href={chatCliente(o.whatsapp, saludo(o))} target="_blank" rel="noopener noreferrer" className={SUAVE}>
              <MessageCircle className="h-5 w-5" aria-hidden="true" /> WhatsApp
            </a>
            <a href={enlaceLlamada(o.whatsapp)} className={SUAVE}><Phone className="h-5 w-5" aria-hidden="true" /> Llamar</a>
          </>
        )}
        {/* Lo que se usa poco va en "Más": en celular la botonera queda en una o dos filas. Se abre hacia arriba porque la tarjeta recorta lo que sale. */}
        <details className="relative ml-auto">
          <summary className={`${SUAVE} cursor-pointer list-none px-4 [&::-webkit-details-marker]:hidden`}>
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" /> Más
          </summary>
          <div className="absolute bottom-full right-0 z-20 mb-2 w-64 rounded-2xl bg-[#151515] p-1.5 shadow-2xl shadow-black/70 ring-1 ring-white/10"
            onClick={(e) => { if ((e.target as HTMLElement).closest("button")) (e.currentTarget.parentElement as HTMLDetailsElement).open = false; }}>
            <button onClick={() => descargarCsv(o)} className={MENU}><Download className="h-5 w-5" aria-hidden="true" /> CSV para OpenLabel+</button>
            {rol === "admin" && o.whatsapp && <button onClick={() => descargar(vcard(o), "text/vcard", `${o.numero}.vcf`)} className={MENU}><UserPlus className="h-5 w-5" aria-hidden="true" /> Agendar contacto</button>}
            {rol === "admin" && <button onClick={() => setEditar(true)} className={MENU}><Pencil className="h-5 w-5" aria-hidden="true" /> Editar datos</button>}
            {rol === "admin" && (
              <button onClick={() => { if (confirm(`¿Borrar ${o.numero} de ${o.nombre}? No se puede deshacer.`)) onBorrar(); }} className={`${MENU} text-[#ff9b80] hover:bg-red-500/15`}>
                <Trash2 className="h-5 w-5" aria-hidden="true" /> Borrar caso
              </button>
            )}
          </div>
        </details>
        {editar && <Suspense fallback={null}><EditarCaso o={o} onCerrar={cerrarEditar} onGuardado={onEditado} /></Suspense>}
      </div>
    </article>
  );
}

/** Fotos del equipo al recibirlo (golpes, rayones, piezas que faltan): respaldo si después hay un reclamo. */
function FotosEntrada({ o, rol }: { o: Orden; rol: Rol }) {
  const [fotos, setFotos] = useState<number[]>(o.fotos_entrada ?? []);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  // Evita que el navegador muestre una foto vieja si se borra la última y se sube otra con el mismo número.
  const [version, setVersion] = useState(() => Date.now());
  const input = useRef<HTMLInputElement>(null);
  const subir = async (archivos: FileList | null) => {
    if (!archivos?.length) return;
    setError("");
    setSubiendo(true);
    for (const archivo of Array.from(archivos)) {
      try { setFotos((await api<{ fotos: number[] }>("foto_entrada", { id: o.id, foto: await reducirFoto(archivo) })).fotos); }
      catch (err) { setError((err as Error).message); break; }
    }
    setSubiendo(false);
    setVersion(Date.now());
    if (input.current) input.current.value = "";
  };
  const borrar = async (n: number) => {
    if (!confirm("¿Borrar esta foto?")) return;
    try { setFotos((await api<{ fotos: number[] }>("borrar_foto", { id: o.id, n })).fotos); }
    catch (err) { setError((err as Error).message); }
  };
  const url = (n: number) => `${API}?accion=foto&id=${o.id}&n=${n}&v=${version}`;
  return (
    <section className={`${CARD} p-5 md:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={TITULO}>Fotos de entrada</h2>
          <p className="text-sm text-white/55">Cómo llegó el equipo. {fotos.length}/8</p>
        </div>
        <label className={`${SUAVE} cursor-pointer px-4 py-2.5 text-sm ${subiendo || fotos.length >= 8 ? "pointer-events-none opacity-50" : ""}`}>
          {subiendo ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Camera className="h-4 w-4" aria-hidden="true" />}
          {subiendo ? "Subiendo…" : "Agregar fotos"}
          <input ref={input} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => subir(e.target.files)} disabled={subiendo || fotos.length >= 8} />
        </label>
      </div>
      {fotos.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-white/50">
          Toma fotos al recibirlo: golpes, rayones, tornillos o piezas que faltan. Te cubren si después hay un reclamo.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {fotos.map((n) => (
            <li key={n} className="group relative">
              <a href={url(n)} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl ring-1 ring-white/10 transition hover:ring-white/40">
                <img src={url(n)} alt={`Foto de entrada ${n} de ${o.numero}`} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </a>
              {rol === "admin" && (
                <button onClick={() => borrar(n)} aria-label={`Borrar foto ${n}`}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/75 p-1.5 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100">
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-[#ff9b80]">{error}</p>}
    </section>
  );
}

const QUIEN: Record<string, string> = { admin: "tú", mostrador: "mostrador", cliente: "el cliente, por la web", taller: "en el taller" };

/** Cada cambio de estado del caso, con fecha y quién lo hizo. */
function Historial({ pasos }: { pasos: Paso[] }) {
  return (
    <section className={`${CARD} p-5 md:p-6`}>
      <h2 className={TITULO}>Historial</h2>
      {pasos.length === 0 ? (
        <p className="mt-2 text-sm text-white/50">Este caso es de antes del historial: los cambios nuevos se anotan aquí.</p>
      ) : (
        <ol className="mt-4">
          {pasos.map((p, i) => (
            <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
              {i < pasos.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-4 w-px bg-white/10" />}
              <span aria-hidden="true" className="mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full" style={{ background: COLOR_ESTADO[estadoDe(p.estado)] }} />
              <div>
                <p className="text-sm font-medium text-white">{ESTADOS[estadoDe(p.estado)]}</p>
                <p className="text-xs text-white/50">{fecha(p.fecha)}{p.quien ? ` · ${QUIEN[p.quien] ?? p.quien}` : ""}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** Solo admin: estado (con las reglas de entrega), cotización de placa, presupuesto, aviso al cliente y enlace de seguimiento. */
function PanelEstado({ o, onCambio, onEstado }: { o: Orden; onCambio: () => void; onEstado: (estado: string) => void }) {
  const [monto, setMonto] = useState(o.presupuesto != null ? String(o.presupuesto) : "");
  const [placa, setPlaca] = useState(o.placa != null ? String(o.placa) : "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [copiado, copiar] = useCopiar();
  const e = estadoDe(o.estado);
  const cotizada = o.placa != null;
  const sinReparar = e === "no_reparado" || e === "devuelto";
  const enviar = async (cambios: Record<string, string>) => {
    setGuardando(true);
    try { await api("actualizar", { id: o.id, ...cambios }); setError(""); }
    catch (err) { setError((err as Error).message); }
    setGuardando(false);
    onCambio();
  };
  // El estado se ve cambiado al instante en todo el tablero; si el servidor falla, se vuelve a leer lo guardado.
  const elegir = (pedido: string) => {
    const d = destinoEstado(e, pedido, cotizada);
    if ("error" in d) { setError(d.error); return; }
    if (d.estado === e) return;
    onEstado(d.estado);
    enviar({ estado: d.estado });
  };
  const presupuesto = monto.trim() ? Number(monto) : (o.presupuesto ?? null);
  const mensajes = mensajesCliente(o, presupuesto, o.placa);
  const sugerido = mensajes.find((m) => m.id === MENSAJE_DE[e]);
  const otros = mensajes.filter((m) => m !== sugerido);

  return (
    <section className={`${CARD} space-y-6 p-5 md:p-6`}>
      <div>
        <h2 className={TITULO}>Estado</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PASOS.map((id) => {
            const activo = (e === "devuelto" ? "entregado" : e) === id;
            const bloqueo = !activo && destinoEstado(e, id, cotizada);
            const motivo = bloqueo && "error" in bloqueo ? bloqueo.error : "";
            const nombre = id === "entregado" && sinReparar ? "Entregado sin reparar" : ESTADOS[id];
            return (
              <button key={id} aria-pressed={activo} aria-disabled={!!motivo} disabled={guardando} onClick={() => elegir(id)} title={motivo || undefined}
                className={`${PRESS} flex min-h-12 items-center gap-2 rounded-2xl px-3.5 py-2.5 text-left text-sm leading-tight ring-1 disabled:opacity-60 ${
                  activo ? "font-semibold text-black ring-transparent" : motivo ? "cursor-not-allowed text-white/35 ring-white/[0.05]" : "text-white ring-white/[0.08] hover:bg-white/[0.06] hover:ring-white/25"}`}
                style={activo ? { background: COLOR_ESTADO[e] } : undefined}>
                <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: activo ? "rgba(0,0,0,0.55)" : COLOR_ESTADO[id], opacity: motivo ? 0.4 : 1 }} />
                {nombre}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-white/40">"Entregado" se habilita cuando marcas el resultado; si no se reparó, después de cotizar la placa.</p>
      </div>

      {/* Regla del negocio: todo equipo no reparado recibe la cotización del reemplazo de placa. */}
      {sinReparar && (
        <div className={`rounded-2xl p-4 ring-1 ${cotizada ? "bg-white/[0.03] ring-white/10" : "bg-[#ef4444]/10 ring-[#ef4444]/45"}`}>
          <p className="flex items-center gap-2 font-semibold text-white"><CircuitBoard className="h-5 w-5 text-[#f87171]" aria-hidden="true" /> Reemplazo de placa</p>
          <p className="mt-1 text-sm text-white/60">{cotizada ? "Cotizado. Envíale la cotización si todavía no la tiene." : "Obligatorio: cotízalo antes de entregar el equipo."}</p>
          <form className="mt-3 flex gap-2" onSubmit={(ev) => { ev.preventDefault(); if (placa.trim()) enviar({ placa }); }}>
            <span className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">S/</span>
              <input inputMode="decimal" value={placa} onChange={(ev) => setPlaca(ev.target.value.replace(/[^\d.]/g, ""))} aria-label="Costo del reemplazo de placa en soles"
                autoFocus={!cotizada} placeholder="0" className={`${CAMPO} pl-11 pr-4`} />
            </span>
            <button disabled={guardando || !placa.trim()} className={`${BTN} bg-white px-5 text-black hover:bg-white/90 disabled:opacity-50`}>Guardar</button>
          </form>
        </div>
      )}

      {!sinReparar && (
        <div>
          <h2 className={TITULO}>Presupuesto de reparación</h2>
          <form className="mt-3 flex gap-2" onSubmit={(ev) => { ev.preventDefault(); enviar({ presupuesto: monto }); }}>
            <span className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">S/</span>
              <input inputMode="decimal" value={monto} onChange={(ev) => setMonto(ev.target.value.replace(/[^\d.]/g, ""))} aria-label="Presupuesto en soles" className={`${CAMPO} pl-11 pr-4`} />
            </span>
            <button disabled={guardando} className={`${BTN} bg-white px-5 text-black hover:bg-white/90 disabled:opacity-50`}>Guardar</button>
          </form>
        </div>
      )}

      {o.whatsapp && (
        <div>
          <h2 className={TITULO}>Avisar al cliente</h2>
          {sugerido && (!sinReparar || cotizada || sugerido.id !== "placa") ? (
            <a href={chatCliente(o.whatsapp, sugerido.texto)} target="_blank" rel="noopener noreferrer"
              className={`${PRESS} mt-3 block rounded-2xl bg-[#25d366]/10 p-4 ring-1 ring-[#25d366]/30 hover:bg-[#25d366]/[0.16] hover:ring-[#25d366]/60`}>
              <span className="flex items-center gap-2 text-base font-semibold text-white">
                <MessageCircle className="h-5 w-5 text-[#25d366]" aria-hidden="true" /> {sugerido.titulo}
                <span className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-[#4ade80]">Abrir WhatsApp <ChevronRight className="h-4 w-4" aria-hidden="true" /></span>
              </span>
              <span className="mt-1.5 line-clamp-3 block text-sm text-white/60">{sugerido.texto}</span>
            </a>
          ) : (
            <p className="mt-2 text-sm text-white/50">{sinReparar ? "Guarda la cotización de la placa y aquí aparece el mensaje para enviársela." : "Sin mensaje para este estado."}</p>
          )}
          <details className="group mt-3">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-sm text-white/55 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" /> Otros mensajes
            </summary>
            <div className="mt-2 grid gap-2">
              {otros.map((m) => (
                <a key={m.id} href={chatCliente(o.whatsapp, m.texto)} target="_blank" rel="noopener noreferrer"
                  className={`${PRESS} rounded-2xl bg-white/[0.05] px-4 py-3 text-left hover:bg-white/[0.1]`}>
                  <span className="flex items-center gap-2 text-sm font-medium text-white"><MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" /> {m.titulo}</span>
                  <span className="mt-1 line-clamp-2 block text-xs text-white/50">{m.texto}</span>
                </a>
              ))}
            </div>
          </details>
        </div>
      )}

      {o.seguir && (
        <div>
          <h2 className={TITULO}>Enlace de seguimiento</h2>
          <p className="mt-1 text-sm text-white/55">El cliente ve aquí cómo va su equipo, sin escribirte. Va incluido en los mensajes de "Recibido" y "Listo".</p>
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-black/40 py-1.5 pl-4 pr-1.5">
            <Link2 className="h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-white/60">{urlSeguimiento(o.seguir)}</span>
            <button onClick={() => copiar(urlSeguimiento(o.seguir!))} className={`${PRESS} inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-white/80 hover:bg-white/[0.08] hover:text-white`}>
              {copiado ? <Check className="h-4 w-4 text-primary" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />} {copiado ? "Copiado" : "Copiar"}
            </button>
            <a href={`/seguimiento/?t=${o.seguir}`} target="_blank" rel="noopener noreferrer" aria-label="Ver la página de seguimiento" title="Ver como el cliente"
              className={`${PRESS} rounded-full p-2 text-white/70 hover:bg-white/[0.08] hover:text-white`}><ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
          </div>
        </div>
      )}

      {error && <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-[#ff9b80] ring-1 ring-red-500/30">{error}</p>}
    </section>
  );
}

/** Lo que abre el QR de la etiqueta: un solo equipo. A la izquierda el caso; a la derecha estado e historial. */
function Caso({ id, rol, imprimir, onSalida, onCambio, onEstado, onVolver }: { id: number; rol: Rol; imprimir: boolean; onSalida: () => void; onCambio: () => void; onEstado: (id: number, estado: string) => void; onVolver: () => void }) {
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
  const recargar = () => { cargar(); onCambio(); };

  return (
    <div className="mt-6">
      <a href="/taller/" onClick={(e) => { e.preventDefault(); onVolver(); }} className="group inline-flex items-center gap-2 text-base text-white/60 transition-colors hover:text-white">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" /> Todos los equipos
        <kbd className="ml-1 hidden rounded-md border border-white/15 px-1.5 font-mono text-xs text-white/40 md:inline">Esc</kbd>
      </a>
      {error && <p role="alert" className="mt-6 rounded-2xl bg-red-500/15 px-5 py-4 text-red-200">{error}</p>}
      {!o && !error && <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-white/50" aria-label="Cargando" />}
      {o && (
        // En pantallas chicas el orden es: caso, estado e historial, fotos e informe (el estado no queda debajo del informe largo).
        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <Tarjeta o={o} rol={rol} imprimirAlAbrir={imprimir} onRecibir={async () => { await api("recibir", { id: o.id }); recargar(); }}
              onBorrar={async () => {
                try { await api("borrar", { id: o.id }); window.location.href = "/taller/"; }
                catch (err) { setError((err as Error).message); }
              }} onEditado={recargar} />
          </div>
          <div className="min-w-0 space-y-4 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            {rol === "admin" && <PanelEstado key={`${o.presupuesto}-${o.placa}`} o={o} onCambio={recargar} onEstado={(estado) => { setO({ ...o, estado }); onEstado(o.id, estado); }} />}
            <Historial pasos={o.historial ?? []} />
          </div>
          <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-2">
            <FotosEntrada o={o} rol={rol} />
            {rol === "admin" && <Suspense fallback={null}><InformeTecnico o={o} /></Suspense>}
          </div>
        </div>
      )}
    </div>
  );
}

/** Grupos del tablero: "Entregado" junta también los que se devolvieron sin reparar. */
const GRUPOS = ["registrado", "recibido", "diagnostico", "reparado", "no_reparado", "entregado"];
const grupoDe = (estado: string) => { const e = estadoDe(estado); return e === "devuelto" ? "entregado" : e; };
/** Lo que pide hacer algo ya: atrasado o no reparado sin cotización de placa. */
const porAtender = (o: Resumen, ahora: number) => atrasado(o, ahora) || faltaCotizar(o);
const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
/** Busca por QF, cliente, equipo, serie o WhatsApp (sin tildes ni mayúsculas; el teléfono también sin espacios). */
const coincide = (o: Resumen, q: string) => {
  const t = sinTildes(q.trim());
  return !t || sinTildes(`${o.numero} ${o.nombre} ${equipo(o)} ${o.serie} ${o.whatsapp}`).includes(t) || (/\d{3}/.test(t) && (o.whatsapp ?? "").replace(/\D/g, "").includes(t.replace(/\D/g, "")));
};
/** Día en Lima (AAAA-MM-DD) de una fecha guardada. */
const diaDe = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Lima" }) : "");

/** Menú de la izquierda: todos los casos con el color de su estado, para ubicarlos rápido. */
function MenuCasos({ ordenes, actual, abierto, onAbrir, onCerrar }: { ordenes: Resumen[]; actual: number | null; abierto: boolean; onAbrir: (id: number) => void; onCerrar: () => void }) {
  const [q, setQ] = useState("");
  const busca = q.trim();
  const lista = ordenes.filter((o) => coincide(o, q));
  // Con el cajón abierto (pantallas chicas) la página de atrás no se desplaza; Esc lo cierra (atajo general del tablero).
  useEffect(() => {
    if (!abierto) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = antes; };
  }, [abierto]);
  return (
    <>
      {abierto && <div aria-hidden="true" onClick={onCerrar} className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden" />}
      <aside className={`${abierto ? "fixed inset-y-0 left-0 z-40 flex shadow-2xl shadow-black" : "hidden"} h-[100svh] w-72 max-w-[85vw] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0a] lg:sticky lg:top-0 lg:z-auto lg:flex lg:shadow-none xl:w-80`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <a href="/taller/" onClick={(e) => { e.preventDefault(); onAbrir(0); }} className="px-1 text-lg font-bold text-white transition-opacity hover:opacity-80">QUICK<span className="text-primary">FIX</span></a>
            <button onClick={onCerrar} aria-label="Cerrar menú" className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white lg:hidden"><X className="h-5 w-5" aria-hidden="true" /></button>
          </div>
          <label className="relative mt-4 block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, QF, modelo o celular" aria-label="Buscar caso"
              className="h-10 w-full rounded-xl bg-white/[0.06] pl-9 pr-3 text-sm text-white transition-colors placeholder:text-white/35 hover:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <p className="mt-3 px-1 text-xs font-medium uppercase tracking-wider text-white/40">Casos · {lista.length}</p>
        </div>
        <nav aria-label="Casos" className="flex-1 overflow-y-auto px-2 pb-4">
          {lista.length === 0 && <p className="px-3 py-2 text-sm text-white/45">{busca ? "Ningún caso coincide." : "Todavía no hay casos."}</p>}
          <ul className="space-y-0.5">
            {lista.map((o) => (
              <li key={o.id}>
                <a href={`/taller/?qf=${o.id}`} onClick={(e) => { e.preventDefault(); onAbrir(o.id); }} aria-current={actual === o.id ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${actual === o.id ? "bg-white/[0.09]" : "hover:bg-white/[0.05]"}`}>
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

/** Aviso corto de casos nuevos (sin archivo de audio). El navegador solo deja sonar después de un clic en la página, como el de entrar. */
function sonar() {
  try {
    const c = new AudioContext();
    const osc = c.createOscillator();
    const vol = c.createGain();
    osc.frequency.value = 880;
    vol.gain.setValueAtTime(0.15, c.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
    osc.connect(vol).connect(c.destination);
    osc.onended = () => c.close();
    osc.start();
    osc.stop(c.currentTime + 0.5);
  } catch { /* sin audio: queda el aviso escrito y el número en la pestaña */ }
}

const ORDEN = { recientes: "Más recientes", antiguos: "Más antiguos", tiempo: "Más tiempo en su estado" } as const;

/** Una fila del tablero: lo justo para ubicar el caso y moverlo de estado; el detalle se abre al tocarla. */
function Fila({ o, rol, ahora, onAbrir, onRecibir, onEstado }: {
  o: Resumen; rol: Rol; ahora: number; onAbrir: () => void; onRecibir: () => void; onEstado: (estado: string) => void;
}) {
  const e = estadoDe(o.estado);
  const pendiente = e === "registrado";
  const dias = diasEnEstado(o, ahora);
  const avisos = [o.liquido === 1 && "Se mojó", o.abierto === 1 && "Ya lo abrieron"].filter(Boolean) as string[];
  const llega = o.llega && (o.llega === diaLima() ? "hoy" : new Date(`${o.llega}T12:00`).toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short" }));
  const mensaje = mensajesCliente(o).find((m) => m.id === MENSAJE_DE[e]);
  return (
    <article className={`group/fila relative overflow-hidden rounded-2xl p-4 pt-5 ring-1 transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/50 focus-within:ring-white/25 md:p-5 md:pt-6 ${pendiente ? "bg-primary/[0.08] ring-primary/35 hover:bg-primary/[0.12]" : "bg-white/[0.035] ring-white/[0.07] hover:bg-white/[0.06] hover:ring-white/15"}`}>
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5" style={{ background: COLOR_ESTADO[e] }} />
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        {/* El enlace cubre toda la fila (after:inset-0); los botones de abajo quedan por encima. */}
        <a href={`/taller/?qf=${o.id}`} data-fila onClick={(ev) => { ev.preventDefault(); onAbrir(); }}
          className="rounded font-mono text-xl font-bold text-primary after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{o.numero}</a>
        <Chip estado={o.estado} />
        {faltaCotizar(o) ? <Alerta>Falta cotizar placa</Alerta> : atrasado(o, ahora) && <Alerta>Atrasado</Alerta>}
        <span className="ml-auto whitespace-nowrap text-sm text-white/50">
          {pendiente ? (o.modo === "recojo" ? "Recojo" : "Lo trae") + (llega ? ` · ${llega}` : "") : `${dias === 0 ? "Hoy" : dias === 1 ? "1 día" : `${dias} días`} en este estado`}
        </span>
      </div>
      <p className="mt-1.5 truncate text-lg font-bold text-white">{o.nombre} <span className="font-normal text-white/55">· {equipo(o)}</span></p>
      {avisos.length > 0 && <p className="text-sm font-medium text-[#ff9b80]">⚠ {avisos.join(" · ")}</p>}
      <Progreso estado={o.estado} chico />
      <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2">
        {pendiente && (
          <button onClick={onRecibir} className={`${PRESS} inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-[#ff7a1f]`}>
            <Check className="h-4 w-4" aria-hidden="true" /> Recibir e imprimir
          </button>
        )}
        {rol === "admin" && !pendiente && (
          <label className="relative inline-flex items-center">
            <span className="sr-only">Cambiar estado de {o.numero}</span>
            <span aria-hidden="true" className="pointer-events-none absolute left-3.5 h-2.5 w-2.5 rounded-full" style={{ background: COLOR_ESTADO[e] }} />
            <select value={grupoDe(o.estado)} onChange={(ev) => onEstado(ev.target.value)}
              className={`${PRESS} h-9 cursor-pointer appearance-none rounded-full bg-white/[0.08] pl-8 pr-8 text-sm text-white hover:bg-white/[0.14] [&>option]:bg-[#151515]`}>
              {PASOS.map((id) => {
                const d = destinoEstado(e, id, !!o.cotizada);
                return <option key={id} value={id} disabled={"error" in d && grupoDe(o.estado) !== id}>{id === "entregado" && (e === "no_reparado" || e === "devuelto") ? "Entregado sin reparar" : ESTADOS[id]}</option>;
              })}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-white/60" aria-hidden="true" />
          </label>
        )}
        {rol === "admin" && o.whatsapp && (
          <a href={chatCliente(o.whatsapp, mensaje && mensaje.id !== "placa" ? mensaje.texto : saludo(o))} target="_blank" rel="noopener noreferrer"
            aria-label={`Avisar a ${o.nombre} por WhatsApp`} title={mensaje && mensaje.id !== "placa" ? `Avisar: ${mensaje.titulo}` : "WhatsApp"}
            className={`${PRESS} inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-white hover:bg-[#25d366] hover:text-black`}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
        <span aria-hidden="true" className="ml-auto inline-flex items-center gap-1 text-sm text-white/40 transition-[color,transform] group-hover/fila:translate-x-0.5 group-hover/fila:text-white/80">
          Abrir <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}

/** Franja naranja de arriba (como los bloques destacados de la web): el día de un vistazo. */
function ResumenDia({ ordenes, rol }: { ordenes: Resumen[]; rol: Rol }) {
  const hoy = diaLima();
  const porCobrar = ordenes.filter((o) => estadoDe(o.estado) === "reparado").reduce((s, o) => s + (o.presupuesto ?? 0), 0);
  const datos = [
    { n: String(ordenes.filter((o) => diaDe(o.recibido) === hoy).length), t: "Entraron hoy" },
    { n: String(ordenes.filter((o) => grupoDe(o.estado) === "entregado" && diaDe(o.cambio) === hoy).length), t: "Entregados hoy" },
    { n: String(ordenes.filter((o) => !["registrado", "entregado"].includes(grupoDe(o.estado))).length), t: "En el taller" },
    ...(rol === "admin" ? [{ n: `S/ ${porCobrar.toLocaleString("es-PE")}`, t: "Por cobrar (reparados)" }] : []),
  ];
  return (
    <section aria-label="Resumen del día" className="mt-6 rounded-3xl bg-primary p-5 text-black md:p-6">
      <p className="text-sm font-semibold text-black/70">Hoy · {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Lima" })}</p>
      <div className={`mt-3 grid grid-cols-2 gap-x-4 gap-y-3 ${rol === "admin" ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        {datos.map((d) => (
          <div key={d.t}>
            <p className="font-display text-3xl font-bold tabular-nums tracking-[-0.03em] md:text-4xl">{d.n}</p>
            <p className="text-sm text-black/75">{d.t}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Tablero del taller: menú de casos a la izquierda, resumen del día, contadores, buscador y una fila por caso. */
const TallerPage = () => {
  const [rol, setRol] = useState<Rol | null | undefined>(undefined);
  const [caso, setCaso] = useState<number | null>(null);
  const [imprimirAl, setImprimirAl] = useState(false);
  const [ordenes, setOrdenes] = useState<Resumen[]>([]);
  const [filtro, setFiltro] = useState("todos");
  const [orden, setOrden] = useState<keyof typeof ORDEN>("recientes");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(false);
  const [menu, setMenu] = useState(false);
  const [buscar, setBuscar] = useState("");
  const buscador = useRef<HTMLInputElement>(null);
  // Sube con cada cambio hecho aquí: una lectura que salió antes no lo pisa con el estado viejo.
  const version = useRef(0);
  // Casos ya vistos: solo los que aparecen después avisan con sonido.
  const vistos = useRef<Set<number> | null>(null);

  // Siempre trae todos: el menú, el buscador y los contadores los necesitan; el filtro se aplica aquí.
  const cargar = useCallback(async () => {
    const v = version.current;
    setCargando(true);
    try {
      const lista = (await api<{ rol: Rol; ordenes: Resumen[] }>("lista")).ordenes;
      if (v === version.current) {
        const nuevos = vistos.current ? lista.filter((o) => !vistos.current!.has(o.id) && o.estado === "registrado") : [];
        vistos.current = new Set(lista.map((o) => o.id));
        if (nuevos.length) {
          sonar();
          setAviso(`Nuevo registro: ${nuevos.map((o) => `${o.numero} ${o.nombre}`).join(", ")}`);
        }
        setOrdenes(lista);
        setError("");
      }
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
    setImprimirAl(false);
  }, []);
  useEffect(() => {
    leerUrl();
    window.addEventListener("popstate", leerUrl);
    api<{ rol: Rol | null }>("sesion").then((r) => setRol(r.rol)).catch((e) => { setRol(null); setError(e.message); });
    return () => window.removeEventListener("popstate", leerUrl);
  }, [leerUrl]);
  const abrir = useCallback((id: number | null, imprimir = false) => {
    setCaso(id || null);
    setImprimirAl(imprimir);
    window.history.pushState(null, "", id ? `/taller/?qf=${id}` : "/taller/");
    window.scrollTo({ top: 0 });
  }, []);

  // Se actualiza sola cada 30 s (un cliente puede registrarse en el mostrador), pero no mientras la pestaña está oculta;
  // al volver a la pestaña se pone al día de inmediato.
  useEffect(() => {
    if (!rol) return;
    cargar();
    const t = setInterval(() => { if (!document.hidden) cargar(); }, 30_000);
    const alVolver = () => { if (!document.hidden) cargar(); };
    document.addEventListener("visibilitychange", alVolver);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", alVolver); };
  }, [rol, cargar]);

  // Los que esperan ser recibidos se ven en la pestaña del navegador aunque estés en otra.
  const pendientes = ordenes.filter((o) => o.estado === "registrado").length;
  useEffect(() => {
    if (rol) document.title = `${pendientes ? `(${pendientes}) ` : ""}Taller | QuickFix`;
  }, [rol, pendientes]);

  // Atajos: / buscar · j k moverse entre casos · Esc cierra el menú o vuelve al tablero.
  useEffect(() => {
    const atajo = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.ctrlKey || e.metaKey || e.altKey || document.querySelector('[aria-modal="true"]')) return;
      const escribiendo = /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable;
      if (e.key === "Escape") {
        if (menu) setMenu(false);
        else if (caso && !escribiendo) abrir(null);
        return;
      }
      if (escribiendo) return;
      if (e.key === "/" && buscador.current) { e.preventDefault(); buscador.current.focus(); }
      if (e.key === "j" || e.key === "k") {
        const filas = [...document.querySelectorAll<HTMLElement>("[data-fila]")];
        if (!filas.length) return;
        const i = filas.indexOf(document.activeElement as HTMLElement);
        const sig = filas[Math.min(filas.length - 1, Math.max(0, i === -1 ? 0 : i + (e.key === "j" ? 1 : -1)))];
        sig.focus();
        sig.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", atajo);
    return () => window.removeEventListener("keydown", atajo);
  }, [menu, caso, abrir]);

  /** Cambio de estado: se ve al instante; si el servidor falla, la lectura siguiente trae lo que de verdad quedó. */
  const ponerEstado = useCallback((id: number, estado: string) => {
    version.current++;
    setOrdenes((os) => os.map((x) => (x.id === id ? { ...x, estado, cambio: new Date().toISOString() } : x)));
  }, []);
  const cambiarEstado = async (o: Resumen, pedido: string) => {
    const d = destinoEstado(estadoDe(o.estado), pedido, !!o.cotizada);
    if ("error" in d) { setError(d.error); return; }
    ponerEstado(o.id, d.estado);
    // Sin reparar: se abre el caso para cotizar la placa, que es obligatorio.
    if (d.estado === "no_reparado") abrir(o.id);
    try { await api("actualizar", { id: o.id, estado: d.estado }); setError(""); }
    catch (err) { setError((err as Error).message); }
    cargar();
  };
  const recibir = async (o: Resumen) => {
    try { await api("recibir", { id: o.id }); }
    catch (err) { setError((err as Error).message); return; }
    ponerEstado(o.id, "recibido");
    abrir(o.id, true);
    cargar();
  };

  const renumerar = async () => {
    if (!confirm("Los casos que quedan se numeran otra vez desde QF-0001, en el mismo orden.\n\nBorra antes los de prueba. Los que cambien de número necesitan etiqueta nueva (su QR cambia). ¿Seguir?")) return;
    try {
      const { cambios } = await api<{ cambios: number }>("renumerar", {});
      setAviso(cambios ? `Listo: ${cambios} caso(s) cambiaron de número. Vuelve a imprimir sus etiquetas.` : "Ya estaban en orden desde QF-0001.");
      cargar();
    } catch (err) { setError((err as Error).message); }
  };

  const ahora = Date.now();
  const contadores = [
    { id: "todos", nombre: "Todos", n: ordenes.length, color: "#ffffff" },
    { id: "atender", nombre: "Por atender", n: ordenes.filter((o) => porAtender(o, ahora)).length, color: "#fb7185" },
    ...GRUPOS.map((g) => ({ id: g, nombre: g === "entregado" ? "Entregados" : ESTADOS[g], n: ordenes.filter((o) => grupoDe(o.estado) === g).length, color: COLOR_ESTADO[g] })),
  ];
  const enFiltro = (o: Resumen) => filtro === "todos" || (filtro === "atender" ? porAtender(o, ahora) : grupoDe(o.estado) === filtro);
  const visibles = ordenes.filter((o) => enFiltro(o) && coincide(o, buscar));
  if (orden === "antiguos") visibles.reverse();
  if (orden === "tiempo") visibles.sort((a, b) => diasEnEstado(b, ahora) - diasEnEstado(a, ahora));

  return (
    <div className="min-h-[100svh] bg-[#050505] lg:flex">
      {rol && <MenuCasos ordenes={ordenes} actual={caso} abierto={menu} onAbrir={(id) => { setMenu(false); abrir(id); }} onCerrar={() => setMenu(false)} />}
      <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 pb-24 pt-5 sm:px-5 md:px-8 md:pt-8 2xl:max-w-[1440px]">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <a href="/taller/" onClick={(e) => { if (rol) { e.preventDefault(); abrir(null); } }} className={`text-xl font-bold text-white transition-opacity hover:opacity-80 sm:text-2xl ${rol ? "lg:invisible" : ""}`}>
            QUICK<span className="text-primary">FIX</span> <span className="font-normal text-white/50">· Taller</span>
          </a>
          {rol && (
            <span className="flex gap-2">
              <button onClick={() => setMenu(true)} className={`${SUAVE} px-4 lg:hidden`}>
                <PanelLeft className="h-5 w-5" aria-hidden="true" /> Casos
              </button>
              <button onClick={async () => { await api("salir", {}); setRol(null); }} aria-label="Salir" className={`${BTN} px-4 text-white/60 hover:bg-white/[0.08] hover:text-white sm:px-5`}>
                <LogOut className="h-5 w-5" aria-hidden="true" /> <span className="hidden sm:inline">Salir</span>
              </button>
            </span>
          )}
        </header>

        {rol === undefined && <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-white/50" aria-label="Cargando" />}
        {rol === null && <Login onEntrar={setRol} />}

        {rol && caso && <Caso key={caso} id={caso} rol={rol} imprimir={imprimirAl} onSalida={salida} onCambio={cargar} onVolver={() => abrir(null)} onEstado={ponerEstado} />}

        {rol && !caso && (
          <>
            <div className="mt-4 flex flex-wrap items-end gap-2">
              <h1 className="mr-auto font-display text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">Tablero</h1>
              {rol === "admin" && (
                <>
                  <a href="/api/recepcion.php?accion=csv" title="Descargar todo para Excel" aria-label="Descargar todo para Excel" className={`${BTN} px-4 text-white/60 hover:bg-white/[0.08] hover:text-white`}>
                    <Download className="h-5 w-5" aria-hidden="true" /> <span className="hidden md:inline">Excel</span>
                  </a>
                  <button onClick={renumerar} title="Renumerar desde QF-0001" aria-label="Renumerar desde QF-0001" className={`${BTN} px-4 text-white/60 hover:bg-white/[0.08] hover:text-white`}>
                    <ListOrdered className="h-5 w-5" aria-hidden="true" /> <span className="hidden md:inline">Renumerar</span>
                  </button>
                </>
              )}
              <button onClick={cargar} aria-label="Actualizar" title="Actualizar" className={`${SUAVE} px-4`}>
                <RefreshCw className={`h-5 w-5 ${cargando ? "animate-spin" : ""}`} aria-hidden="true" />
              </button>
              <a href="/recepcion/" className={`${PRINCIPAL} px-4 sm:px-5`}>
                <Plus className="h-5 w-5" aria-hidden="true" /> <span className="hidden sm:inline">Registrar equipo</span><span className="sm:hidden">Registrar</span>
              </a>
            </div>

            <ResumenDia ordenes={ordenes} rol={rol} />

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <label className="relative block flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" aria-hidden="true" />
                <input ref={buscador} type="search" value={buscar} onChange={(e) => setBuscar(e.target.value)} onKeyDown={(e) => e.key === "Escape" && setBuscar("")}
                  placeholder="Buscar por nombre, QF, modelo, serie o celular" aria-label="Buscar casos" className={`${CAMPO} rounded-2xl pl-12 pr-12 md:h-14`} />
                <kbd aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/15 px-2 py-0.5 font-mono text-xs text-white/45 md:block">/</kbd>
              </label>
              <label className="relative inline-flex items-center">
                <span className="sr-only">Ordenar casos</span>
                <select value={orden} onChange={(e) => setOrden(e.target.value as keyof typeof ORDEN)}
                  className={`${CAMPO} cursor-pointer appearance-none rounded-2xl pl-4 pr-10 sm:w-auto md:h-14 [&>option]:bg-[#151515]`}>
                  {Object.entries(ORDEN).map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 h-4 w-4 text-white/60" aria-hidden="true" />
              </label>
            </div>
            <p className="mt-2 hidden px-1 text-xs text-white/35 md:block">
              Atajos: <kbd className="font-mono">/</kbd> buscar · <kbd className="font-mono">j</kbd> <kbd className="font-mono">k</kbd> moverse entre casos · <kbd className="font-mono">Enter</kbd> abrir · <kbd className="font-mono">Esc</kbd> volver
            </p>
            {buscar.trim() && <p role="status" className="mt-2 px-1 text-sm text-white/55">{visibles.length} {visibles.length === 1 ? "caso encontrado" : "casos encontrados"}{filtro !== "todos" ? " en este filtro" : ""}</p>}

            {/* Contadores: cada uno filtra las filas de abajo. */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 min-[480px]:grid-cols-4 xl:grid-cols-8">
              {contadores.map((c) => (
                <button key={c.id} aria-pressed={filtro === c.id} onClick={() => setFiltro(c.id)}
                  className={`${PRESS} relative overflow-hidden rounded-2xl p-3 pt-4 text-left ring-1 hover:-translate-y-0.5 md:p-4 md:pt-5 ${filtro === c.id ? "bg-white/[0.1] ring-white/30" : "bg-white/[0.035] ring-white/[0.07] hover:bg-white/[0.07] hover:ring-white/15"}`}>
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: c.color }} />
                  <span className={`block font-display text-2xl font-bold tabular-nums md:text-3xl ${c.id === "atender" && c.n ? "text-[#fda4af]" : "text-white"}`}>{c.n}</span>
                  <span className="mt-0.5 block text-xs leading-tight text-white/60 md:text-sm">{c.nombre}</span>
                </button>
              ))}
            </div>

            {aviso && (
              <p role="status" className="mt-4 flex items-start gap-3 rounded-2xl bg-primary/[0.12] px-5 py-3 text-white ring-1 ring-primary/30">
                <span className="flex-1">{aviso}</span>
                <button onClick={() => setAviso("")} aria-label="Cerrar aviso" className="rounded-full p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"><X className="h-4 w-4" aria-hidden="true" /></button>
              </p>
            )}
            {error && (
              <p role="alert" className="mt-4 flex items-start gap-3 rounded-2xl bg-red-500/15 px-5 py-4 text-red-200">
                <span className="flex-1">{error}</span>
                <button onClick={() => setError("")} aria-label="Cerrar error" className="rounded-full p-1 text-red-200/70 transition-colors hover:bg-white/10 hover:text-white"><X className="h-4 w-4" aria-hidden="true" /></button>
              </p>
            )}

            <div className="mt-5 grid gap-3 xl:grid-cols-2 min-[1800px]:grid-cols-3">
              {visibles.length === 0 && !cargando && (
                <p className="rounded-3xl bg-white/[0.035] p-8 text-center text-lg text-white/60 ring-1 ring-white/[0.07] xl:col-span-2 min-[1800px]:col-span-3">
                  {filtro === "registrado" ? "No hay equipos por recibir. Cuando un cliente se registre, aparece aquí solo." : buscar.trim() ? "Ningún caso coincide con la búsqueda." : filtro === "atender" ? "Nada pendiente. ¡Bien!" : ordenes.length ? "No hay casos en este estado." : "Todavía no hay equipos."}
                </p>
              )}
              {visibles.map((o) => (
                <Fila key={o.id} o={o} rol={rol} ahora={ahora} onAbrir={() => abrir(o.id)} onRecibir={() => recibir(o)} onEstado={(estado) => cambiarEstado(o, estado)} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TallerPage;
