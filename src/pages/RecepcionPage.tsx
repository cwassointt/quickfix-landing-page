import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, ArrowLeft, Camera, Check, ImageUp, Loader2, ScanLine, Search, Sparkles, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import AsistenteFalla, { type Resultado } from "@/components/AsistenteFalla";
import { laptopLabel, searchLaptops, type Laptop } from "@/lib/laptopSearch";
import { FICHAS, OPCIONES, api, avisoCliente, diaLima, sugerirCorreo, sugerirDistrito, validar, type Campo as CampoId, type Registro } from "@/lib/recepcion";

const PRESS = "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";
const INPUT = "mt-2 h-12 w-full rounded-xl bg-white/[0.06] px-4 text-base text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-primary";
/** Campo con error: borde y fondo naranja rojizo. */
const MAL = "ring-2 ring-[#ff5a36] bg-[#ff5a36]/[0.08] focus:ring-[#ff5a36]";
const chip = (on: boolean) => `${PRESS} rounded-full px-4 py-2.5 text-base ${on ? "bg-primary text-black" : "bg-white/[0.06] text-white hover:bg-white/[0.12]"}`;

const VACIO: Registro = {
  nombre: "", dni: "", whatsapp: "", correo: "", distrito: "", como: "", tipo: "", marca: "", modelo: "", serie: "", pin: "",
  accesorios: "", servicio: "", falla: "", liquido: null, abierto: null, acepta: false, web: "",
  cuando: "", llega: "", modo: "taller", direccion: "", autoriza: 0, foto: "",
};

const Aviso = ({ id, msg }: { id: string; msg?: string }) =>
  msg ? (
    <p id={`error-${id}`} className="mt-2 flex items-start gap-1.5 text-sm text-[#ff7a5c] animate-in fade-in duration-150">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {msg}
    </p>
  ) : null;

const Campo = ({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) => (
  <div>
    <label htmlFor={`campo-${id}`} className={`text-base font-medium ${error ? "text-[#ff7a5c]" : "text-white"}`}>{label}</label>
    {hint && <span className="ml-2 text-sm text-white/50">{hint}</span>}
    {children}
    <Aviso id={id} msg={error} />
  </div>
);

/** Botones tipo píldora: una opción (o varias con `multi`). */
function Opciones({ id, label, opciones, valor, onChange, multi = false, error, children }: {
  id?: string; label: string; opciones: string[]; valor: string; onChange: (v: string) => void; multi?: boolean; error?: string; children?: ReactNode;
}) {
  // Solo las de selección múltiple se guardan separadas por coma; una opción puede llevar comas ("IA (ChatGPT, Gemini…)").
  const elegidas = !valor ? [] : multi ? valor.split(", ") : [valor];
  const toggle = (o: string) => {
    if (!multi) return onChange(valor === o ? "" : o);
    const next = elegidas.includes(o) ? elegidas.filter((x) => x !== o) : [...elegidas, o];
    onChange(opciones.filter((x) => next.includes(x)).join(", "));
  };
  return (
    <fieldset id={id ? `campo-${id}` : undefined} aria-invalid={!!error || undefined} aria-describedby={error ? `error-${id}` : undefined}>
      <legend className={`text-base font-medium ${error ? "text-[#ff7a5c]" : "text-white"}`}>{label}</legend>
      <div className={`mt-2 flex flex-wrap gap-2 rounded-2xl ${error ? "p-2 ring-2 ring-[#ff5a36] bg-[#ff5a36]/[0.08]" : ""}`}>
        {opciones.map((o) => (
          <button key={o} type="button" aria-pressed={elegidas.includes(o)} onClick={() => toggle(o)} className={chip(elegidas.includes(o))}>{o}</button>
        ))}
        {children}
      </div>
      {id && <Aviso id={id} msg={error} />}
    </fieldset>
  );
}

const SiNo = ({ label, valor, onChange }: { label: string; valor: boolean | null; onChange: (v: boolean) => void }) => (
  <fieldset className="flex flex-wrap items-center justify-between gap-3">
    <legend className="float-left text-base text-white">{label}</legend>
    <div className="flex gap-2">
      {[true, false].map((v) => (
        <button key={String(v)} type="button" aria-pressed={valor === v} onClick={() => onChange(v)} className={`${chip(valor === v)} w-16 px-0`}>
          {v ? "Sí" : "No"}
        </button>
      ))}
    </div>
  </fieldset>
);

/** Input con lista de sugerencias debajo (distritos, correos). Se cierra al elegir una. */
function ConSugerencias({ input, sugerir, onElegir }: {
  input: React.InputHTMLAttributes<HTMLInputElement> & { value: string; onChange: (e: { target: { value: string } }) => void };
  sugerir: (v: string) => string[];
  onElegir: (v: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const lista = abierto ? sugerir(input.value) : [];
  return (
    <>
      <input {...input} autoComplete="off"
        onChange={(e) => { input.onChange(e); setAbierto(true); }}
        onKeyDown={(e) => { if (e.key === "Enter" && lista[0]) { e.preventDefault(); onElegir(lista[0]); setAbierto(false); } }} />
      {lista.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {lista.map((s) => (
            <li key={s}>
              <button type="button" onClick={() => { onElegir(s); setAbierto(false); }}
                className={`${PRESS} rounded-full bg-white/[0.08] px-3.5 py-2 text-sm text-white hover:bg-white/[0.16]`}>
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** Modelo de laptop con la misma lista del cotizador: al elegir uno se completan marca y modelo. */
function ModeloLaptop({ valor, error, onEscribir, onElegir, onBlur }: {
  valor: string; error?: string; onEscribir: (v: string) => void; onElegir: (l: Laptop) => void; onBlur: () => void;
}) {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [abierto, setAbierto] = useState(false);
  useEffect(() => { import("@/data/laptops.json").then((m) => setLaptops(m.default)); }, []);
  const resultados = abierto && valor.trim().length >= 2 ? searchLaptops(laptops, valor, 5) : [];
  return (
    <Campo id="modelo" label="Modelo" hint="escríbelo y elígelo de la lista" error={error}>
      <span className="relative mt-2 block">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" aria-hidden="true" />
        <input id="campo-modelo" value={valor} placeholder="Strix G614JV, Legion 5, TUF F15…" autoComplete="off" onBlur={onBlur}
          aria-invalid={!!error || undefined} aria-describedby={error ? "error-modelo" : undefined}
          onChange={(e) => { onEscribir(e.target.value); setAbierto(true); }}
          onKeyDown={(e) => { if (e.key === "Enter" && resultados[0]) { e.preventDefault(); onElegir(resultados[0]); setAbierto(false); } }}
          className={`${INPUT} mt-0 pl-12 ${error ? MAL : ""}`} />
      </span>
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
    </Campo>
  );
}

/** Reduce la foto en el navegador (lado mayor 1600 px, JPEG) para que suba rápido con datos móviles. */
async function reducirFoto(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const escala = Math.min(1, 1600 / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * escala);
  canvas.height = Math.round(img.height * escala);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

export type DatosEtiqueta = { tipo: string; marca: string; modelo: string; serie: string };

/** Pasa el código del modelo ("G614JV") al nombre de la lista del cotizador ("ROG Strix G16 G614JV") si lo encuentra. */
async function nombreDeLista(d: DatosEtiqueta): Promise<DatosEtiqueta> {
  if (!d.modelo || (d.tipo && d.tipo !== "Laptop")) return d;
  const lista: Laptop[] = (await import("@/data/laptops.json")).default;
  const hit = searchLaptops(lista, d.modelo, 1)[0];
  const sinEspacios = (s: string) => s.replace(/[\s-]/g, "").toLowerCase();
  if (!hit || !sinEspacios(laptopLabel(hit)).includes(sinEspacios(d.modelo))) return d;
  return { ...d, tipo: "Laptop", marca: hit.brand, modelo: [hit.name, hit.code].filter(Boolean).join(" ") };
}

type Lectura = { estado: "nada" | "leyendo" | "listo" | "aviso"; msg?: string };

/** Función principal de la ficha 02: foto de la etiqueta → marca, modelo y S/N completados solos. */
function EscanerEtiqueta({ foto, onFoto, onDatos }: { foto: string; onFoto: (v: string) => void; onDatos: (d: DatosEtiqueta) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const galeria = useRef<HTMLInputElement>(null);
  const [lectura, setLectura] = useState<Lectura>({ estado: "nada" });

  async function procesar(file: File) {
    let dataUrl: string;
    try { dataUrl = await reducirFoto(file); }
    catch { return setLectura({ estado: "aviso", msg: "No pude abrir esa foto. Prueba con otra." }); }
    onFoto(dataUrl);
    setLectura({ estado: "leyendo" });
    try {
      const d = await api<DatosEtiqueta & { legible: boolean }>("leer", { foto: dataUrl });
      if (!d.legible || !(d.marca || d.modelo || d.serie)) {
        return setLectura({ estado: "aviso", msg: "No se lee bien la etiqueta. Toma otra foto más cerca y con luz, o escribe los datos abajo." });
      }
      onDatos(await nombreDeLista(d));
      const faltan = [!d.marca && "marca", !d.modelo && "modelo", !d.serie && "número de serie"].filter(Boolean);
      setLectura({ estado: "listo", msg: faltan.length ? `Completé lo que se lee. Falta: ${faltan.join(", ")}.` : "Completé marca, modelo y número de serie. Revisa que estén bien." });
    } catch (err) {
      // Sin lectura automática (no configurada o falló): la foto igual queda guardada.
      setLectura({ estado: "aviso", msg: `${(err as Error).message} La foto queda guardada.` });
    }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/[0.16] to-primary/[0.04] p-5 ring-1 ring-primary/30">
      {/* Uno abre la cámara directo; el otro (sin capture) deja elegir una foto ya tomada. */}
      {[input, galeria].map((ref, i) => (
        <input key={i} ref={ref} type="file" accept="image/*" capture={i === 0 ? "environment" : undefined} className="sr-only" tabIndex={-1} aria-hidden="true"
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) procesar(f); }} />
      ))}
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-black"><ScanLine className="h-5 w-5" aria-hidden="true" /></span>
        <div>
          <p className="text-lg font-bold text-white">Escanea la etiqueta</p>
          <p className="mt-1 text-sm leading-relaxed text-white/70">Tómale foto a la etiqueta de abajo del equipo y completo marca, modelo y número de serie por ti.</p>
        </div>
      </div>

      {foto ? (
        <div className="mt-4 flex items-center gap-4">
          <img src={foto} alt="Foto de la etiqueta" className="h-20 w-28 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p role="status" className={`flex items-start gap-1.5 text-sm ${lectura.estado === "aviso" ? "text-[#ff9b80]" : "text-white/85"}`}>
              {lectura.estado === "leyendo" && <><Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" aria-hidden="true" /> Leyendo la etiqueta…</>}
              {lectura.estado === "listo" && <><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {lectura.msg}</>}
              {lectura.estado === "aviso" && <><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {lectura.msg}</>}
            </p>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => input.current?.click()} disabled={lectura.estado === "leyendo"}
                className={`${PRESS} rounded-full bg-white/[0.1] px-4 py-2 text-sm text-white hover:bg-white/[0.16] disabled:opacity-50`}>Otra foto</button>
              <button type="button" onClick={() => galeria.current?.click()} disabled={lectura.estado === "leyendo"}
                className={`${PRESS} rounded-full px-3 py-2 text-sm text-white/75 hover:bg-white/[0.08] disabled:opacity-50`}>Subir</button>
              <button type="button" onClick={() => { onFoto(""); setLectura({ estado: "nada" }); }} aria-label="Quitar foto"
                className={`${PRESS} rounded-full p-2 text-white/60 hover:bg-white/[0.08]`}><X className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <button type="button" onClick={() => input.current?.click()}
            className={`${PRESS} mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-medium text-black hover:bg-[#ff7a1f]`}>
            <Camera className="h-5 w-5" aria-hidden="true" /> Tomar foto a la etiqueta
          </button>
          <button type="button" onClick={() => galeria.current?.click()}
            className={`${PRESS} mt-2 flex w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm text-white/80 ring-1 ring-white/20 hover:bg-white/[0.06]`}>
            <ImageUp className="h-4 w-4" aria-hidden="true" /> Subir una foto que ya tengo
          </button>
          {lectura.estado === "aviso" && <Aviso id="foto" msg={lectura.msg} />}
        </>
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
  // Errores: se muestran cuando el cliente sale del campo o intenta avanzar, y se borran apenas lo corrige.
  const [vistos, setVistos] = useState<Set<CampoId>>(new Set());
  const errores = validar(r);
  const ver = (k: CampoId) => (vistos.has(k) ? errores[k] : undefined);
  const tocar = (...ks: CampoId[]) => setVistos((v) => new Set([...v, ...ks]));

  // Carrusel de fichas: 0 datos, 1 equipo, 2 falla y entrega. Las fichas se deslizan y la altura sigue a la ficha visible.
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

  const set = <K extends keyof Registro>(k: K) => (v: Registro[K]) => setR((x) => ({ ...x, [k]: v }));
  /** Props de un input de texto: valor, error en rojo y accesibilidad. */
  const campo = (k: CampoId & keyof Registro) => ({
    id: `campo-${k}`,
    value: r[k] as string,
    onChange: (e: { target: { value: string } }) => set(k)(e.target.value),
    onBlur: () => tocar(k),
    "aria-invalid": !!ver(k) || undefined,
    "aria-describedby": ver(k) ? `error-${k}` : undefined,
    className: `${INPUT} ${ver(k) ? MAL : ""}`,
  });

  /** Marca los campos de la ficha y lleva al primero con error. */
  const revisar = (i: number) => {
    tocar(...FICHAS[i]);
    const malo = FICHAS[i].find((k) => errores[k]);
    if (!malo) return true;
    const el = document.getElementById(`campo-${malo}`);
    (el?.matches("input, textarea") ? el : el?.querySelector<HTMLElement>("button, input"))?.focus({ preventScroll: true });
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  };
  const avanzar = () => { if (revisar(paso)) setPaso(paso + 1); };

  const usarResumen = (res: Resultado) => {
    setR((x) => ({
      ...x,
      servicio: res.servicio,
      falla: x.falla.trim() ? `${res.texto}\n${x.falla.trim()}` : res.texto,
      liquido: res.liquido ?? x.liquido,
      abierto: res.abierto ?? x.abierto,
    }));
    tocar("falla");
    setAsistente(false);
  };

  const elegirCuando = (c: string) =>
    setR((x) => ({
      ...x,
      cuando: c,
      llega: c === "Mañana" ? diaLima(1) : c === "Otro día" ? "" : c ? diaLima() : "",
      modo: c === "Ya estoy en el taller" ? "taller" : x.modo,
    }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (paso < 2) return avanzar(); // Enter en las primeras fichas avanza en vez de enviar
    // Si algo quedó mal en una ficha anterior, vuelve a ella.
    const fichaMala = FICHAS.findIndex((cs) => cs.some((k) => errores[k]));
    if (fichaMala !== -1) {
      tocar(...FICHAS.flat());
      if (fichaMala !== paso) setPaso(fichaMala);
      else revisar(paso);
      return;
    }
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
              {r.modo === "recojo" && " Te escribo para coordinar el recojo."}
            </p>
            <a href={avisoCliente(numero, r)} target="_blank" rel="noopener noreferrer"
              className={`${PRESS} mt-8 inline-flex rounded-full bg-primary px-8 py-4 text-lg font-medium text-black hover:bg-[#ff7a1f]`}>
              Enviar mi número por WhatsApp
            </a>
            <p className="mt-3 text-sm text-white/50">Así te aviso por ahí cuando tu equipo esté listo.</p>
          </div>
          <button type="button" onClick={() => { setR(VACIO); setVistos(new Set()); setPaso(0); setEstado("form"); }}
            className={`${PRESS} mt-6 w-full rounded-full bg-white/[0.08] px-6 py-4 text-base text-white hover:bg-white/[0.14]`}>
            Registrar otro equipo
          </button>
        </main>
      </div>
    );
  }

  const enTaller = r.cuando === "Ya estoy en el taller";

  return (
    <div className="min-h-[100svh] bg-[#050505]">
      <Navbar />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-[120px] md:px-8 md:pt-[150px]">
        <h1 className="section-title">Registra tu equipo</h1>
        <p className="section-lead">Toma 2 minutos. Al terminar te doy un número de orden para seguir tu reparación.</p>

        <form ref={formRef} onSubmit={enviar} noValidate className="section-body scroll-mt-28">
          <div className="overflow-clip transition-[height] duration-300 ease-out motion-reduce:transition-none" style={{ height: alto }}>
            <div className="flex items-start gap-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{ transform: `translateX(calc(${-paso} * (100% + 1rem)))` }}>

              <div ref={(el) => (fichas.current[0] = el)} className="w-full shrink-0" aria-hidden={paso !== 0}>
                <Bloque n="01" title="Tus datos" sub="Para avisarte cuando tu equipo esté listo.">
                  <Campo id="nombre" label="Nombres y apellidos" error={ver("nombre")}><input autoComplete="name" {...campo("nombre")} /></Campo>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Campo id="whatsapp" label="WhatsApp" error={ver("whatsapp")}><input type="tel" inputMode="tel" autoComplete="tel" placeholder="987 654 321" {...campo("whatsapp")} /></Campo>
                    <Campo id="dni" label="DNI o CE" hint="opcional" error={ver("dni")}><input inputMode="numeric" maxLength={12} {...campo("dni")} /></Campo>
                    <Campo id="correo" label="Correo" hint="opcional" error={ver("correo")}>
                      <ConSugerencias input={{ type: "email", inputMode: "email", placeholder: "nombre@gmail.com", ...campo("correo") }} sugerir={sugerirCorreo} onElegir={set("correo")} />
                    </Campo>
                    <Campo id="distrito" label="Distrito" hint="opcional" error={ver("distrito")}>
                      <ConSugerencias input={{ placeholder: "San Miguel, Surco…", ...campo("distrito") }} sugerir={sugerirDistrito} onElegir={set("distrito")} />
                    </Campo>
                  </div>
                  <Opciones label="¿Cómo nos conociste?" opciones={OPCIONES.como} valor={r.como} onChange={set("como")} />
                </Bloque>
              </div>

              <div ref={(el) => (fichas.current[1] = el)} className="w-full shrink-0" aria-hidden={paso !== 1}>
                <Bloque n="02" title="Tu equipo">
                  <EscanerEtiqueta foto={r.foto} onFoto={set("foto")} onDatos={(d) => {
                    setR((x) => ({ ...x, tipo: d.tipo || x.tipo, marca: d.marca || x.marca, modelo: d.modelo || x.modelo, serie: d.serie || x.serie }));
                    tocar(...(["tipo", "marca", "modelo", "serie"] as const).filter((k) => d[k]));
                  }} />
                  <p className="flex items-center gap-3 text-sm text-white/45" aria-hidden="true">
                    <span className="h-px flex-1 bg-white/10" /> o complétalo a mano <span className="h-px flex-1 bg-white/10" />
                  </p>
                  <Opciones id="tipo" label="Tipo de equipo" opciones={OPCIONES.tipo} valor={r.tipo} error={ver("tipo")} onChange={(v) => { set("tipo")(v); tocar("tipo"); }} />
                  {r.tipo === "Laptop" ? (
                    <>
                      <ModeloLaptop valor={r.modelo} error={ver("modelo")} onEscribir={set("modelo")} onBlur={() => tocar("modelo")}
                        onElegir={(l) => setR((x) => ({ ...x, marca: l.brand, modelo: [l.name, l.code].filter(Boolean).join(" ") }))} />
                      <Campo id="marca" label="Marca" error={ver("marca")}><input placeholder="Se completa sola al elegir el modelo" {...campo("marca")} /></Campo>
                    </>
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Campo id="marca" label="Marca" error={ver("marca")}><input placeholder="ASUS, Lenovo, Sony…" {...campo("marca")} /></Campo>
                      <Campo id="modelo" label="Modelo" error={ver("modelo")}><input placeholder={r.tipo === "Consola" ? "PS5 Slim, PS4 Pro…" : "Modelo"} {...campo("modelo")} /></Campo>
                    </div>
                  )}
                  <Campo id="serie" label="Número de serie (S/N)" hint="en la etiqueta de abajo del equipo" error={ver("serie")}>
                    <input autoCapitalize="characters" placeholder="Si no lo encuentras, déjalo vacío" {...campo("serie")} className={`${campo("serie").className} font-mono uppercase`} />
                  </Campo>
                  <Campo id="pin" label="Contraseña o PIN de inicio" hint="opcional, para probarlo">
                    <input id="campo-pin" autoComplete="off" value={r.pin} onChange={(e) => set("pin")(e.target.value)} className={INPUT} />
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
                  <Campo id="falla" label="Cuéntame la falla" error={ver("falla")}>
                    <textarea rows={4} placeholder="Se apaga al jugar, no carga, no da imagen…" {...campo("falla")} className={`${campo("falla").className} h-auto py-3 leading-relaxed`} />
                  </Campo>
                  <SiNo label="¿Le cayó líquido?" valor={r.liquido} onChange={set("liquido")} />
                  <SiNo label="¿Lo abrió otro técnico antes?" valor={r.abierto} onChange={set("abierto")} />

                  <fieldset>
                    <legend className="text-base font-medium text-white">Si la reparación cuesta hasta…</legend>
                    <p className="mt-1 text-sm text-white/55">…avanzo sin esperar tu respuesta. Siempre te aviso el precio.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {OPCIONES.autoriza.map(([t, v]) => (
                        <button key={v} type="button" aria-pressed={r.autoriza === v} onClick={() => set("autoriza")(v)} className={chip(r.autoriza === v)}>{t}</button>
                      ))}
                    </div>
                  </fieldset>

                  <div className="space-y-5 border-t border-white/10 pt-5">
                    <Opciones id={r.cuando === "Otro día" ? undefined : "llega"} label="¿Cuándo traes el equipo?" opciones={OPCIONES.cuando} valor={r.cuando} error={r.cuando === "Otro día" ? undefined : ver("llega")}
                      onChange={(v) => { elegirCuando(v); tocar("llega"); }} />
                    {r.cuando === "Otro día" && (
                      <Campo id="llega" label="Elige el día" error={ver("llega")}>
                        <input id="campo-llega" type="date" min={diaLima()} max={diaLima(60)} value={r.llega} onChange={(e) => set("llega")(e.target.value)} onBlur={() => tocar("llega")}
                          aria-invalid={!!ver("llega") || undefined} className={`${INPUT} [color-scheme:dark] ${ver("llega") ? MAL : ""}`} />
                      </Campo>
                    )}
                    {r.cuando && !enTaller && (
                      <Opciones label="¿Cómo nos lo entregas?" opciones={["Lo llevo al taller", "Recójanlo en mi casa"]}
                        valor={r.modo === "recojo" ? "Recójanlo en mi casa" : "Lo llevo al taller"}
                        onChange={(v) => set("modo")(v === "Recójanlo en mi casa" ? "recojo" : "taller")} />
                    )}
                    {r.modo === "recojo" && !enTaller && (
                      <Campo id="direccion" label="Dirección para el recojo" hint="calle, número y referencia" error={ver("direccion")}>
                        <input autoComplete="street-address" {...campo("direccion")} />
                        <p className="mt-2 text-sm text-white/55">El costo del recojo depende de tu distrito; te lo confirmo por WhatsApp.</p>
                      </Campo>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-5">
                    <label className={`flex items-start gap-3 rounded-2xl text-base text-white/80 ${ver("acepta") ? "p-3 ring-2 ring-[#ff5a36] bg-[#ff5a36]/[0.08]" : ""}`}>
                      <input id="campo-acepta" type="checkbox" checked={r.acepta} onChange={(e) => { set("acepta")(e.target.checked); tocar("acepta"); }}
                        aria-invalid={!!ver("acepta") || undefined} aria-describedby={ver("acepta") ? "error-acepta" : undefined}
                        className="mt-1 h-5 w-5 shrink-0 accent-[#FF6600]" />
                      <span>
                        Acepto los <a href="/terminos/" target="_blank" className="text-primary underline underline-offset-4">términos</a> y la{" "}
                        <a href="/garantia/" target="_blank" className="text-primary underline underline-offset-4">garantía</a> de QuickFix, y que me contacten por
                        WhatsApp sobre este equipo. Hice una copia de mis datos.
                      </span>
                    </label>
                    <Aviso id="acepta" msg={ver("acepta")} />
                  </div>
                </Bloque>
              </div>
            </div>
          </div>

          {/* Trampa para robots: fuera de la vista y del teclado. */}
          <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px]" value={r.web} onChange={(e) => set("web")(e.target.value)} />

          {/* Progreso: 3 puntitos; tocando uno anterior se vuelve a esa ficha. */}
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <button key={i} type="button" disabled={i > paso} onClick={() => setPaso(i)} aria-label={`Ficha ${i + 1} de 3`} aria-current={i === paso ? "step" : undefined}
                className={`h-2.5 rounded-full transition-all duration-300 ${i === paso ? "w-8 bg-primary" : i < paso ? "w-2.5 bg-white/60 hover:bg-white" : "w-2.5 bg-white/20"}`} />
            ))}
          </div>

          {error && <p role="alert" className="mt-6 rounded-2xl bg-[#ff5a36]/15 px-5 py-4 text-base text-[#ffb4a3]">{error}</p>}

          <div className="mt-6 flex gap-3">
            {paso > 0 && (
              <button type="button" onClick={() => { setError(""); setPaso(paso - 1); }} aria-label="Ficha anterior"
                className={`${PRESS} flex items-center justify-center rounded-full bg-white/[0.08] px-6 py-4 text-white hover:bg-white/[0.14]`}>
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            {/* Keys distintas: sin ellas React reutiliza el mismo botón y, al pasar a la ficha 03,
                el clic de "Siguiente" termina como "submit" y envía el formulario. */}
            {paso < 2 ? (
              <button key="siguiente" type="button" onClick={avanzar} className={`${PRESS} flex-1 rounded-full bg-white px-8 py-4 text-lg font-medium text-black hover:bg-white/90`}>
                Siguiente
              </button>
            ) : (
              <button key="enviar" type="submit" disabled={estado === "enviando"}
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
