import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import { OPCIONES, api, type Orden } from "@/lib/recepcion";

const PRESS = "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]";
const CAMPO = "mt-1.5 h-12 w-full rounded-xl bg-white/[0.06] px-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary [&>option]:bg-[#111]";

type Texto = "nombre" | "whatsapp" | "dni" | "correo" | "distrito" | "como" | "tipo" | "marca" | "modelo" | "serie" | "pin" | "accesorios" | "servicio" | "falla" | "direccion";
const sino = (v: 0 | 1 | null) => (v === 1 ? "si" : v === 0 ? "no" : "");
const deSino = (v: string) => (v === "si" ? true : v === "no" ? false : null);
// Un valor antiguo que ya no está en la lista se sigue mostrando, para no perderlo al guardar.
const conActual = (lista: string[], actual: string) => (actual && !lista.includes(actual) ? [actual, ...lista] : lista);

function Campo({ label, children, ancho }: { label: string; children: ReactNode; ancho?: boolean }) {
  return <label className={`block text-sm text-white/60 ${ancho ? "sm:col-span-2" : ""}`}>{label}{children}</label>;
}

/** Solo admin: corrige los datos del cliente y del equipo. El N° de orden y el estado no se tocan aquí. */
export function EditarCaso({ o, onCerrar, onGuardado }: { o: Orden; onCerrar: () => void; onGuardado: () => void }) {
  const [f, setF] = useState(() => ({
    nombre: o.nombre, whatsapp: o.whatsapp, dni: o.dni ?? "", correo: o.correo ?? "", distrito: o.distrito ?? "", como: o.como ?? "",
    tipo: o.tipo, marca: o.marca, modelo: o.modelo, serie: o.serie ?? "", pin: o.pin ?? "", accesorios: o.accesorios ?? "",
    servicio: o.servicio ?? "", falla: o.falla, direccion: o.direccion ?? "", modo: o.modo || "taller",
    autoriza: String(o.autoriza ?? 0), liquido: sino(o.liquido), abierto: sino(o.abierto),
  }));
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const texto = (k: Texto, extra: Record<string, unknown> = {}) => <input value={f[k]} onChange={set(k)} className={CAMPO} {...extra} />;

  // Esc cierra, el fondo no se desplaza y el foco entra al primer campo.
  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (ev: KeyboardEvent) => ev.key === "Escape" && onCerrar();
    window.addEventListener("keydown", esc);
    caja.current?.querySelector("input")?.focus();
    return () => { document.body.style.overflow = antes; window.removeEventListener("keydown", esc); };
  }, [onCerrar]);

  const guardar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setGuardando(true);
    try {
      await api("editar", { ...f, id: o.id, llega: o.llega ?? "", autoriza: Number(f.autoriza), liquido: deSino(f.liquido), abierto: deSino(f.abierto) });
      onGuardado();
      onCerrar();
    } catch (err) {
      setError((err as Error).message);
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={onCerrar}>
      <div ref={caja} role="dialog" aria-modal="true" aria-labelledby="editar-titulo" onClick={(ev) => ev.stopPropagation()}
        className="max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-[#111] p-6 sm:rounded-3xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="editar-titulo" className="text-xl font-bold text-white">Editar {o.numero}</h2>
            <p className="mt-1 text-sm text-white/60">El número de orden no cambia. Si corriges datos de la etiqueta, vuelve a imprimirla.</p>
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className={`${PRESS} -mr-2 -mt-1 rounded-full p-2 text-white/70 hover:bg-white/[0.08]`}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={guardar} className="mt-6 space-y-8">
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 text-base font-bold text-white">Cliente</legend>
            <Campo label="Nombres y apellidos" ancho>{texto("nombre", { required: true, autoComplete: "off" })}</Campo>
            <Campo label="WhatsApp">{texto("whatsapp", { required: true, type: "tel", inputMode: "tel" })}</Campo>
            <Campo label="DNI o CE">{texto("dni", { inputMode: "text" })}</Campo>
            <Campo label="Correo">{texto("correo", { type: "email" })}</Campo>
            <Campo label="Distrito">{texto("distrito")}</Campo>
            <Campo label="Cómo llega">
              <select value={f.modo} onChange={set("modo")} className={CAMPO}><option value="taller">Lo trae al taller</option><option value="recojo">Recojo en casa</option></select>
            </Campo>
            {f.modo === "recojo" && <Campo label="Dirección de recojo">{texto("direccion", { required: true })}</Campo>}
            <Campo label="Nos conoció por">
              <select value={f.como} onChange={set("como")} className={CAMPO}><option value="">—</option>{conActual(OPCIONES.como, o.como ?? "").map((x) => <option key={x}>{x}</option>)}</select>
            </Campo>
            <Campo label="Reparar sin consultar">
              <select value={f.autoriza} onChange={set("autoriza")} className={CAMPO}>
                {conActual(OPCIONES.autoriza.map(([, v]) => String(v)), String(o.autoriza ?? 0)).map((v) => <option key={v} value={v}>{OPCIONES.autoriza.find(([, n]) => String(n) === v)?.[0] ?? `Hasta S/ ${v}`}</option>)}
              </select>
            </Campo>
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 text-base font-bold text-white">Equipo</legend>
            <Campo label="Tipo">
              <select value={f.tipo} onChange={set("tipo")} required className={CAMPO}>{conActual(OPCIONES.tipo, o.tipo).map((x) => <option key={x}>{x}</option>)}</select>
            </Campo>
            <Campo label="Marca">{texto("marca", { required: true })}</Campo>
            <Campo label="Modelo" ancho>{texto("modelo", { required: true })}</Campo>
            <Campo label="N° de serie">{texto("serie", { className: `${CAMPO} uppercase` })}</Campo>
            <Campo label="Clave del equipo">{texto("pin", { autoComplete: "off" })}</Campo>
            <Campo label="Deja también">{texto("accesorios", { placeholder: "Cargador, mouse…" })}</Campo>
            <Campo label="Servicio">
              <select value={f.servicio} onChange={set("servicio")} className={CAMPO}><option value="">No sabe</option>{conActual(OPCIONES.servicio, o.servicio ?? "").map((x) => <option key={x}>{x}</option>)}</select>
            </Campo>
            <Campo label="¿Le cayó líquido?">
              <select value={f.liquido} onChange={set("liquido")} className={CAMPO}><option value="">No sabe</option><option value="si">Sí</option><option value="no">No</option></select>
            </Campo>
            <Campo label="¿Otro técnico lo abrió?">
              <select value={f.abierto} onChange={set("abierto")} className={CAMPO}><option value="">No sabe</option><option value="si">Sí</option><option value="no">No</option></select>
            </Campo>
            <Campo label="Qué falla" ancho>
              <textarea value={f.falla} onChange={set("falla")} required rows={4} className={`${CAMPO} h-auto py-3 leading-relaxed`} />
            </Campo>
          </fieldset>

          {error && <p ref={(el) => el?.scrollIntoView({ block: "nearest", behavior: "smooth" })} role="alert" className="rounded-2xl bg-red-500/15 px-5 py-4 text-red-200">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={onCerrar} className={`${PRESS} rounded-full bg-white/[0.08] px-6 py-3 text-base text-white hover:bg-white/[0.14]`}>Cancelar</button>
            <button disabled={guardando} className={`${PRESS} inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-medium text-black hover:bg-[#ff7a1f] disabled:opacity-60`}>
              {guardando && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />} Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
