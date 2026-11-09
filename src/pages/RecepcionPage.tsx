import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Check, Loader2, Search, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import AsistenteFalla, { type Resultado } from "@/components/AsistenteFalla";
import { laptopLabel, searchLaptops, type Laptop } from "@/lib/laptopSearch";
import { OPCIONES, api, avisoCliente, type Registro } from "@/lib/recepcion";

const PRESS = "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";
const INPUT = "mt-2 h-12 w-full rounded-xl bg-white/[0.06] px-4 text-base text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-primary";

const VACIO: Registro = {
  nombre: "", dni: "", whatsapp: "", correo: "", distrito: "", como: "", tipo: "", marca: "", modelo: "", serie: "", pin: "",
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
function Opciones({ label, opciones, valor, onChange, multi = false, children }: { label: string; opciones: string[]; valor: string; onChange: (v: string) => void; multi?: boolean; children?: ReactNode }) {
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
        {children}
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

/** Modelo de laptop con la misma lista del cotizador: al elegir uno se completan marca y modelo. */
function ModeloLaptop({ valor, onEscribir, onElegir }: { valor: string; onEscribir: (v: string) => void; onElegir: (l: Laptop) => void }) {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [abierto, setAbierto] = useState(false);
  useEffect(() => { import("@/data/laptops.json").then((m) => setLaptops(m.default)); }, []);
  const resultados = abierto && valor.trim().length >= 2 ? searchLaptops(laptops, valor, 5) : [];
  return (
    <div>
      <label className="block">
        <span className="text-base font-medium text-white">Modelo</span>
        <span className="ml-2 text-sm text-white/50">escríbelo y elígelo de la lista</span>
        <span className="relative mt-2 block">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" aria-hidden="true" />
          <input required value={valor} placeholder="Strix G614JV, Legion 5, TUF F15…" autoComplete="off"
            onChange={(e) => { onEscribir(e.target.value); setAbierto(true); }}
            onKeyDown={(e) => { if (e.key === "Enter" && resultados[0]) { e.preventDefault(); onElegir(resultados[0]); setAbierto(false); } }}
            className={`${INPUT} mt-0 pl-12`} />
        </span>
      </label>
      {resultados.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {resultados.map((l) => (
            <li key={laptopLabel(l)}>
              <button type="button" onClick={() => { onElegir(l); setAbierto(false); }}
                className={`${PRESS} w-full rounded-xl bg-white/[0.04] px-4 py-3 text-left hover:bg-white/[0.1]`}>
                <span className="block text-sm text-white/55">{l.brand}</span>
                <span className="block truncate text-base text-white">{[l.name, l.code].filter(Boolean).join(" ")}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const Bloque = ({ n, title, sub, children }: { n: string; title: string; sub?: string; children: ReactNode }) => (
  <section className="rounded-3xl bg-white/[0.04] p-5 md:p-8">
    <p className="font-mono text-sm text-primary">{n} <span className="text-white/35">/ 03</span></p>
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
  const [asistente, setAsistente] = useState(false);
  // Carrusel de fichas: 0 datos, 1 equipo, 2 falla. Las fichas se deslizan y la altura sigue a la ficha visible.
  const [paso, setPaso] = useState(0);
  const [alto, setAlto] = useState<number>();
  const fichas = useRef<(HTMLDivElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    fichas.current.forEach((el, i) => { if (el) el.inert = i !== paso; });
    const el = fichas.current[paso];
    if (!el) return;
    const ro = new ResizeObserver(() => setAlto(el.offsetHeight));
    ro.observe(el);
    const top = formRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 80) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    return () => ro.disconnect();
  }, [paso, estado]);

  /** Revisa la ficha visible: campos obligatorios y, en la 02, el tipo de equipo. */
  const fichaCompleta = () => {
    const campos = [...(fichas.current[paso]?.querySelectorAll<HTMLInputElement>("input, textarea") ?? [])];
    const invalido = campos.find((el) => !el.checkValidity());
    if (invalido) { invalido.reportValidity(); return false; }
    if (paso === 1 && !r.tipo) { setError("Elige el tipo de equipo."); return false; }
    setError("");
    return true;
  };
  const avanzar = () => { if (fichaCompleta()) setPaso(paso + 1); };
  const usarResumen = (res: Resultado) => {
    setR((x) => ({
      ...x,
      servicio: res.servicio,
      falla: x.falla.trim() ? `${res.texto}
${x.falla.trim()}` : res.texto,
      liquido: res.liquido ?? x.liquido,
      abierto: res.abierto ?? x.abierto,
    }));
    setAsistente(false);
  };
  const set = <K extends keyof Registro>(k: K) => (v: Registro[K]) => setR((x) => ({ ...x, [k]: v }));
  const txt = (k: keyof Registro) => ({ value: r[k] as string, onChange: (e: { target: { value: string } }) => set(k)(e.target.value) });

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (paso < 2) return avanzar(); // Enter en las primeras fichas avanza en vez de enviar
    if (!fichaCompleta()) return;
    if (!r.acepta) return setError("Falta aceptar las condiciones.");
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
          <button type="button" onClick={() => { setR(VACIO); setPaso(0); setEstado("form"); }} className={`${PRESS} mt-6 w-full rounded-full bg-white/[0.08] px-6 py-4 text-base text-white hover:bg-white/[0.14]`}>
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

        <form ref={formRef} onSubmit={enviar} noValidate className="section-body scroll-mt-28">
          <div className="overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none" style={{ height: alto }}>
            <div className="flex items-start gap-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{ transform: `translateX(calc(${-paso} * (100% + 1rem)))` }}>
          <div ref={(el) => (fichas.current[0] = el)} className="w-full shrink-0" aria-hidden={paso !== 0}>
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
          </div>

          <div ref={(el) => (fichas.current[1] = el)} className="w-full shrink-0" aria-hidden={paso !== 1}>
          <Bloque n="02" title="Tu equipo">
            <Opciones label="Tipo de equipo" opciones={OPCIONES.tipo} valor={r.tipo} onChange={set("tipo")} />
            {r.tipo === "Laptop" ? (
              <>
                <ModeloLaptop valor={r.modelo} onEscribir={set("modelo")}
                  onElegir={(l) => setR((x) => ({ ...x, marca: l.brand, modelo: [l.name, l.code].filter(Boolean).join(" ") }))} />
                <Campo label="Marca"><input required placeholder="Se completa sola al elegir el modelo" className={INPUT} {...txt("marca")} /></Campo>
              </>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo label="Marca"><input required placeholder="ASUS, Lenovo, Sony…" className={INPUT} {...txt("marca")} /></Campo>
                <Campo label="Modelo"><input required placeholder={r.tipo === "Consola" ? "PS5 Slim, PS4 Pro…" : "Modelo"} className={INPUT} {...txt("modelo")} /></Campo>
              </div>
            )}
            <Campo label="Número de serie (S/N)" hint="en la etiqueta de abajo del equipo">
              <input autoCapitalize="characters" placeholder="Si no lo encuentras, déjalo vacío" className={`${INPUT} font-mono uppercase`} {...txt("serie")} />
            </Campo>
            <Campo label="Contraseña o PIN de inicio" hint="opcional, para probarlo">
              <input autoComplete="off" className={INPUT} {...txt("pin")} />
            </Campo>
            <Opciones label="¿Qué más dejas?" opciones={OPCIONES.accesorios} valor={r.accesorios} onChange={set("accesorios")} multi />
          </Bloque>
          </div>

          <div ref={(el) => (fichas.current[2] = el)} className="w-full shrink-0" aria-hidden={paso !== 2}>
          <Bloque n="03" title="¿Qué le pasa?">
            <Opciones label="Servicio" opciones={OPCIONES.servicio} valor={r.servicio} onChange={set("servicio")}>
              <button type="button" onClick={() => setAsistente(true)}
                className={`${PRESS} inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-base text-primary ring-1 ring-inset ring-primary/60 hover:bg-primary/10`}>
                <Sparkles className="h-4 w-4" aria-hidden="true" /> No sé, ayúdame
              </button>
            </Opciones>
            <Campo label="Cuéntame la falla">
              <textarea required rows={4} placeholder="Se apaga al jugar, no carga, no da imagen…" className={`${INPUT} h-auto py-3 leading-relaxed`} {...txt("falla")} />
            </Campo>
            <SiNo label="¿Le cayó líquido o recibió un golpe?" valor={r.liquido} onChange={set("liquido")} />
            <SiNo label="¿Lo abrió otro técnico antes?" valor={r.abierto} onChange={set("abierto")} />
            <label className="flex items-start gap-3 border-t border-white/10 pt-5 text-base text-white/80">
            <input type="checkbox" checked={r.acepta} onChange={(e) => set("acepta")(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#FF6600]" />
            <span>
              Acepto los <a href="/terminos/" target="_blank" className="text-primary underline underline-offset-4">términos</a> y la{" "}
              <a href="/garantia/" target="_blank" className="text-primary underline underline-offset-4">garantía</a> de QuickFix, y que me contacten por
              WhatsApp sobre este equipo. Hice una copia de mis datos.
            </span>
          </label>
          </Bloque>
          </div>
            </div>
          </div>

          {/* Trampa para robots: fuera de la vista y del teclado. */}
          <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px]" {...txt("web")} />

          {/* Progreso: 3 puntitos; tocando uno anterior se vuelve a esa ficha. */}
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <button key={i} type="button" disabled={i > paso} onClick={() => setPaso(i)} aria-label={`Ficha ${i + 1} de 3`} aria-current={i === paso ? "step" : undefined}
                className={`h-2.5 rounded-full transition-all duration-300 ${i === paso ? "w-8 bg-primary" : i < paso ? "w-2.5 bg-white/60 hover:bg-white" : "w-2.5 bg-white/20"}`} />
            ))}
          </div>

          {error && <p role="alert" className="mt-6 rounded-2xl bg-red-500/15 px-5 py-4 text-base text-red-200">{error}</p>}

          <div className="mt-6 flex gap-3">
            {paso > 0 && (
              <button type="button" onClick={() => { setError(""); setPaso(paso - 1); }} aria-label="Ficha anterior"
                className={`${PRESS} flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-white hover:bg-white/[0.14]`}>
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            {paso < 2 ? (
              <button type="button" onClick={avanzar}
                className={`${PRESS} flex-1 rounded-full bg-white px-8 py-4 text-lg font-medium text-black hover:bg-white/90`}>
                Siguiente
              </button>
            ) : (
              <button type="submit" disabled={estado === "enviando"}
                className={`${PRESS} flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-medium text-black hover:bg-[#ff7a1f] disabled:opacity-60`}>
                {estado === "enviando" && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                Registrar mi equipo
              </button>
            )}
          </div>
        </form>
      </main>
      {asistente && <AsistenteFalla tipo={r.tipo} onCerrar={() => setAsistente(false)} onUsar={usarResumen} />}
    </div>
  );
};

export default RecepcionPage;
