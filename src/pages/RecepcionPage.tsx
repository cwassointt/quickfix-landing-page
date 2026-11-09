import { useState, type ReactNode } from "react";
import { Check, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { OPCIONES, api, avisoCliente, type Registro } from "@/lib/recepcion";

const PRESS = "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";
const INPUT = "mt-2 h-12 w-full rounded-xl bg-white/[0.06] px-4 text-base text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-primary";

const VACIO: Registro = {
  nombre: "", dni: "", whatsapp: "", correo: "", distrito: "", como: "", tipo: "", marca: "", modelo: "", serie: "", color: "", pin: "",
  accesorios: "", servicio: "", falla: "", liquido: null, abierto: null, acepta: false, web: "",
};

const Campo = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <label className="block">
    <span className="text-base font-medium text-white">{label}</span>
    {hint && <span className="ml-2 text-sm text-white/50">{hint}</span>}
    {children}
  </label>
);

/** Botones tipo píldora: una opción (o varias con `multi`). */
function Opciones({ label, opciones, valor, onChange, multi = false }: { label: string; opciones: string[]; valor: string; onChange: (v: string) => void; multi?: boolean }) {
  const elegidas = valor ? valor.split(", ") : [];
  const toggle = (o: string) => {
    if (!multi) return onChange(valor === o ? "" : o);
    const next = elegidas.includes(o) ? elegidas.filter((x) => x !== o) : [...elegidas, o];
    onChange(opciones.filter((x) => next.includes(x)).join(", "));
  };
  return (
    <fieldset>
      <legend className="text-base font-medium text-white">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {opciones.map((o) => {
          const on = elegidas.includes(o);
          return (
            <button key={o} type="button" aria-pressed={on} onClick={() => toggle(o)}
              className={`${PRESS} rounded-full px-4 py-2.5 text-base ${on ? "bg-primary text-black" : "bg-white/[0.06] text-white hover:bg-white/[0.12]"}`}>
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

const SiNo = ({ label, valor, onChange }: { label: string; valor: boolean | null; onChange: (v: boolean) => void }) => (
  <fieldset className="flex flex-wrap items-center justify-between gap-3">
    <legend className="float-left text-base text-white">{label}</legend>
    <div className="flex gap-2">
      {[true, false].map((v) => (
        <button key={String(v)} type="button" aria-pressed={valor === v} onClick={() => onChange(v)}
          className={`${PRESS} w-16 rounded-full py-2.5 text-base ${valor === v ? "bg-primary text-black" : "bg-white/[0.06] text-white hover:bg-white/[0.12]"}`}>
          {v ? "Sí" : "No"}
        </button>
      ))}
    </div>
  </fieldset>
);

const Bloque = ({ n, title, sub, children }: { n: string; title: string; sub?: string; children: ReactNode }) => (
  <section className="rounded-3xl bg-white/[0.04] p-5 md:p-8">
    <p className="font-mono text-sm text-primary">{n}</p>
    <h2 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">{title}</h2>
    {sub && <p className="mt-2 text-white/60">{sub}</p>}
    <div className="mt-6 space-y-5">{children}</div>
  </section>
);

/** Registro de un equipo que se deja en el taller. Lo llena el cliente (QR del mostrador o link por WhatsApp) o el taller. */
const RecepcionPage = () => {
  const [r, setR] = useState<Registro>(VACIO);
  const [estado, setEstado] = useState<"form" | "enviando" | "listo">("form");
  const [error, setError] = useState("");
  const [numero, setNumero] = useState("");
  const set = <K extends keyof Registro>(k: K) => (v: Registro[K]) => setR((x) => ({ ...x, [k]: v }));
  const txt = (k: keyof Registro) => ({ value: r[k] as string, onChange: (e: { target: { value: string } }) => set(k)(e.target.value) });

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const falta = !r.tipo ? "el tipo de equipo" : !r.acepta ? "aceptar las condiciones" : "";
    if (falta) return setError(`Falta ${falta}.`);
    setError("");
    setEstado("enviando");
    try {
      const res = await api<{ numero: string }>("crear", r);
      setNumero(res.numero);
      setEstado("listo");
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError((err as Error).message);
      setEstado("form");
    }
  }

  if (estado === "listo") {
    return (
      <div className="min-h-[100svh] bg-[#050505]">
        <Navbar />
        <main className="mx-auto max-w-2xl px-5 pb-24 pt-[120px] md:px-8 md:pt-[150px]">
          <div className="rounded-3xl bg-white/[0.04] p-6 text-center md:p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-black"><Check className="h-7 w-7" aria-hidden="true" /></span>
            <p className="mt-6 text-lg text-white/70">Tu número de orden es</p>
            <p className="mt-2 font-mono text-6xl font-bold tracking-tight text-primary md:text-7xl">{numero}</p>
            <p className="mx-auto mt-6 max-w-[40ch] text-lg leading-relaxed text-white/80">
              Toma una captura de esta pantalla. Con este número puedes preguntar por tu {r.tipo.toLowerCase()} cuando quieras.
            </p>
            <a href={avisoCliente(numero, r)} target="_blank" rel="noopener noreferrer"
              className={`${PRESS} mt-8 inline-flex rounded-full bg-primary px-8 py-4 text-lg font-medium text-black hover:bg-[#ff7a1f]`}>
              Enviar mi número por WhatsApp
            </a>
            <p className="mt-3 text-sm text-white/50">Así te aviso por ahí cuando tu equipo esté listo.</p>
          </div>
          <button type="button" onClick={() => { setR(VACIO); setEstado("form"); }} className={`${PRESS} mt-6 w-full rounded-full bg-white/[0.08] px-6 py-4 text-base text-white hover:bg-white/[0.14]`}>
            Registrar otro equipo
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#050505]">
      <Navbar />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-[120px] md:px-8 md:pt-[150px]">
        <h1 className="section-title">Registra tu equipo</h1>
        <p className="section-lead">Toma 2 minutos. Al terminar te doy un número de orden para seguir tu reparación.</p>

        <form onSubmit={enviar} className="section-body space-y-4">
          <Bloque n="01" title="Tus datos" sub="Para avisarte cuando tu equipo esté listo.">
            <Campo label="Nombres y apellidos"><input required autoComplete="name" className={INPUT} {...txt("nombre")} /></Campo>
            <div className="grid gap-5 sm:grid-cols-2">
              <Campo label="WhatsApp"><input required type="tel" inputMode="tel" autoComplete="tel" placeholder="987 654 321" className={INPUT} {...txt("whatsapp")} /></Campo>
              <Campo label="DNI o CE" hint="opcional"><input inputMode="numeric" className={INPUT} {...txt("dni")} /></Campo>
              <Campo label="Correo" hint="opcional"><input type="email" autoComplete="email" className={INPUT} {...txt("correo")} /></Campo>
              <Campo label="Distrito" hint="opcional"><input className={INPUT} {...txt("distrito")} /></Campo>
            </div>
            <Opciones label="¿Cómo nos conociste?" opciones={OPCIONES.como} valor={r.como} onChange={set("como")} />
          </Bloque>

          <Bloque n="02" title="Tu equipo">
            <Opciones label="Tipo de equipo" opciones={OPCIONES.tipo} valor={r.tipo} onChange={set("tipo")} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Campo label="Marca"><input required placeholder="ASUS, Lenovo, Sony…" className={INPUT} {...txt("marca")} /></Campo>
              <Campo label="Modelo"><input required placeholder="ROG Strix G15 G513QM" className={INPUT} {...txt("modelo")} /></Campo>
            </div>
            <Campo label="Número de serie (S/N)" hint="en la etiqueta de abajo del equipo">
              <input autoCapitalize="characters" placeholder="Si no lo encuentras, déjalo vacío" className={`${INPUT} font-mono uppercase`} {...txt("serie")} />
            </Campo>
            <Campo label="Color o señas" hint="stickers, golpes, rayones"><input className={INPUT} {...txt("color")} /></Campo>
            <Campo label="Contraseña o PIN de inicio" hint="opcional, para probarlo">
              <input autoComplete="off" className={INPUT} {...txt("pin")} />
            </Campo>
            <Opciones label="¿Qué más dejas?" opciones={OPCIONES.accesorios} valor={r.accesorios} onChange={set("accesorios")} multi />
          </Bloque>

          <Bloque n="03" title="¿Qué le pasa?">
            <Opciones label="Servicio" opciones={OPCIONES.servicio} valor={r.servicio} onChange={set("servicio")} />
            <Campo label="Cuéntame la falla">
              <textarea required rows={4} placeholder="Se apaga al jugar, no carga, no da imagen…" className={`${INPUT} h-auto py-3 leading-relaxed`} {...txt("falla")} />
            </Campo>
            <SiNo label="¿Le cayó líquido o recibió un golpe?" valor={r.liquido} onChange={set("liquido")} />
            <SiNo label="¿Lo abrió otro técnico antes?" valor={r.abierto} onChange={set("abierto")} />
          </Bloque>

          {/* Trampa para robots: fuera de la vista y del teclado. */}
          <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px]" {...txt("web")} />

          <label className="flex items-start gap-3 rounded-3xl bg-white/[0.04] p-5 text-base text-white/80 md:p-8">
            <input type="checkbox" checked={r.acepta} onChange={(e) => set("acepta")(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#FF6600]" />
            <span>
              Acepto los <a href="/terminos/" target="_blank" className="text-primary underline underline-offset-4">términos</a> y la{" "}
              <a href="/garantia/" target="_blank" className="text-primary underline underline-offset-4">garantía</a> de QuickFix, y que me contacten por
              WhatsApp sobre este equipo. Hice una copia de mis datos.
            </span>
          </label>

          {error && <p role="alert" className="rounded-2xl bg-red-500/15 px-5 py-4 text-base text-red-200">{error}</p>}

          <button type="submit" disabled={estado === "enviando"}
            className={`${PRESS} flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-medium text-black hover:bg-[#ff7a1f] disabled:opacity-60`}>
            {estado === "enviando" && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
            Registrar mi equipo
          </button>
        </form>
      </main>
    </div>
  );
};

export default RecepcionPage;
