import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Check, MessageCircle, Plus, Search, X } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";
import { diagnosis, maintenance, type Category, type Service } from "@/data/catalog";
import { buildCart, findService, formatSoles, whatsappUrl, type CartItem } from "@/lib/quote";
import { laptopLabel, searchLaptops, type Laptop } from "@/lib/laptopSearch";
import { QUOTE_EVENT } from "@/lib/site";
import { rogSaving, rogSeparate } from "@/data/pages";

import laptopImg from "../images/services/laptop-maintenance.webp";
import pcImg from "../images/services/pc-gamer-setup.webp";
import gpuImg from "../images/services/gpu-maintenance.webp";
import macbookImg from "../images/services/macbook-maintenance.webp";
import consoleImg from "../images/services/console-ps5.webp";
import toolsImg from "../images/services/hardware-tools.webp";
import boardImg from "../images/repair/gpu-repair.webp";
import laptopGamerImg from "../images/repair/laptopgamer-repair.webp";
import laptopOfficeImg from "../images/repair/laptopoffice-repair.webp";

type Mode = "mantenimiento" | "reparacion";
type PhaseState = "open" | "done" | "locked";
type Saved = CartItem & { key: number };

const CATEGORY_IMG: Record<string, string> = { laptops: laptopImg, pcs: pcImg, gpus: gpuImg, macbook: macbookImg, consolas: consoleImg };
const SERVICE_IMG: Record<string, string> = {
  "laptop-oficina": laptopOfficeImg,
  "laptop-oficina-gpu": laptopOfficeImg,
  "laptop-gamer": laptopGamerImg,
  "laptop-gamer-pro": laptopGamerImg,
  "asus-rog": laptopGamerImg,
  "diag-general": toolsImg,
  "diag-electronico": boardImg,
};

/** Cuánto trabajo térmico lleva cada tipo de laptop (1–4) y ejemplos para reconocerse. */
const TIER: Record<string, { level: number; examples: string }> = {
  "laptop-oficina": { level: 1, examples: "IdeaPad 3, Vivobook 15, HP 15, Inspiron" },
  "laptop-oficina-gpu": { level: 2, examples: "XPS 15, Vivobook Pro, ThinkPad P, Envy 16" },
  "laptop-gamer": { level: 3, examples: "TUF, Nitro 5, Victus, LOQ, Strix G16 RTX 4060" },
  "laptop-gamer-pro": { level: 4, examples: "Legion Pro 7, Strix SCAR, Alienware, Omen 17" },
};

// Springs críticamente amortiguadas (sin rebote): se pueden interrumpir y siempre parten del valor en pantalla.
const SPRING = { type: "spring", bounce: 0, duration: 0.4 } as const;
const SPRING_SLOW = { type: "spring", bounce: 0, duration: 0.6 } as const;
// Respuesta al presionar: en pointer-down, no al soltar.
const PRESS =
  "transition-[transform,background-color,color,opacity] duration-150 ease-out active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b]";
const ROG_PACKAGE = "asus-rog";
const gpus = maintenance.find((c) => c.id === "gpus")!.services;
const fromPrice = (c: Category) => Math.min(...c.services.map((s) => s.price));
const hasPhase3 = (s?: Service) => !!(s?.extras || s?.gpuCombo);
const tierName = (id: string) => findService(id)?.name ?? "";

// Borde inferior dentado de ticket térmico.
const TEAR = `polygon(0 0,100% 0,100% 100%,${Array.from({ length: 20 }, (_, i) => `${100 - (i + 0.5) * 5}% calc(100% - 7px),${100 - (i + 1) * 5}% 100%`).join(",")})`;

/** Panel que se despliega o pliega (acordeón: height es la única opción sin equivalente en transform). */
const Reveal = ({ show, children }: { show: boolean; children: ReactNode }) => {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={reduce ? { duration: 0.2 } : SPRING}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Fase del asistente. Terminada se pliega a un resumen; todo el resumen es un botón para volver a ella. */
const Phase = ({ title, state, summary, onOpen, children }: { title: string; state: PhaseState; summary?: string; onOpen: () => void; children: ReactNode }) => (
  <div className={`rounded-3xl transition-colors duration-200 ${state === "open" ? "bg-white/[0.04]" : ""}`}>
    {state === "done" ? (
      <button
        type="button"
        onClick={onOpen}
        className={`${PRESS} group w-full flex items-center gap-4 text-left rounded-3xl px-5 py-4 bg-white/[0.025] hover:bg-white/[0.08]`}
      >
        <span className="grid place-items-center w-7 h-7 shrink-0 rounded-full bg-orange-500 text-black">
          <Check className="w-4 h-4" strokeWidth={3} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-white/50">{title}</span>
          <span className="block text-lg text-white truncate">{summary}</span>
        </span>
        <span className="text-sm text-white/40 group-hover:text-orange-400 transition-colors duration-150">Cambiar</span>
      </button>
    ) : (
      <p className={`px-5 pt-5 text-lg font-medium ${state === "locked" ? "pb-5 text-white/25" : "text-white"}`}>{title}</p>
    )}
    <Reveal show={state === "open"}>
      <div className="px-5 pb-6 pt-4">{children}</div>
    </Reveal>
  </div>
);

/** Imagen grande del equipo: se "despliega" de abajo hacia arriba cada vez que cambia. */
const DeviceStage = ({ src, title, subtitle }: { src: string; title: string; subtitle?: string }) => {
  const reduce = useReducedMotion();
  return (
    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-white/5 mb-5">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={src}
          className="absolute inset-0"
          initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)", transform: "scale(1.08)" }}
          animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0)", transform: "scale(1)" }}
          exit={{ opacity: 0 }}
          transition={reduce ? { duration: 0.2 } : SPRING_SLOW}
        >
          <OptimizedImage src={src} alt={title} width={800} height={450} sizes="(max-width: 1024px) 92vw, 600px" className="w-full h-full object-cover" />
        </motion.div>
      </AnimatePresence>
      {/* Velo neutro bajo el texto sobre la foto. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" /> {/* taste-skill-ignore: velo neutro bajo texto sobre foto */}
      <motion.div
        key={title}
        initial={{ opacity: 0, transform: reduce ? "none" : "translateY(8px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={reduce ? { duration: 0.2 } : { ...SPRING, delay: 0.12 }}
        className="absolute left-5 bottom-4 right-5"
      >
        <p className="text-2xl md:text-3xl font-bold tracking-[-0.02em] leading-tight">{title}</p>
        {subtitle && <p className="text-white/75">{subtitle}</p>}
      </motion.div>
    </div>
  );
};

/** Fila elegible: círculo (una opción) o casilla (varias). Superficies por tono, sin bordes. */
const Row = ({ active, multi, onClick, title, detail, price }: { active: boolean; multi?: boolean; onClick: () => void; title: string; detail?: string; price?: ReactNode }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`${PRESS} w-full flex items-center gap-4 text-left px-4 py-4 rounded-2xl ${active ? "bg-orange-500/15" : "bg-white/[0.04] hover:bg-white/[0.08]"}`}
  >
    <span
      className={`grid place-items-center w-5 h-5 shrink-0 transition-colors duration-150 ${multi ? "rounded-md" : "rounded-full"} ${
        active ? "bg-orange-500 text-black" : "bg-white/15"
      }`}
    >
      {active && <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-white">{title}</span>
      {detail && <span className="block text-sm text-white/50">{detail}</span>}
    </span>
    {price && <span className="shrink-0 tabular-nums text-white">{price}</span>}
  </button>
);

/** Tarjeta con foto para elegir el tipo de equipo. */
const PickCard = ({ active, onClick, img, title, caption }: { active: boolean; onClick: () => void; img: string; title: string; caption: string }) => (
  <button type="button" aria-pressed={active} onClick={onClick} className={`${PRESS} group text-left rounded-2xl overflow-hidden ${active ? "bg-orange-500" : "bg-white/[0.04] hover:bg-white/[0.08]"}`}>
    <div className="aspect-[5/4] overflow-hidden">
      <OptimizedImage
        src={img}
        alt=""
        width={320}
        height={240}
        sizes="(max-width: 1024px) 30vw, 130px"
        className={`w-full h-full object-cover transition-[opacity,transform] duration-300 ease-out ${
          active ? "opacity-100" : "opacity-60 [@media(hover:hover)]:group-hover:opacity-90 [@media(hover:hover)]:group-hover:scale-[1.04]"
        }`}
      />
    </div>
    <div className="px-3 py-2.5">
      <p className={`text-sm leading-tight font-medium ${active ? "text-black" : "text-white"}`}>{title}</p>
      <p className={`text-xs ${active ? "text-black/70" : "text-white/50"}`}>{caption}</p>
    </div>
  </button>
);

/** Medidor de gama: cuatro tramos, se llenan según el trabajo térmico del tipo de laptop. */
const Meter = ({ level, inverted }: { level: number; inverted?: boolean }) => (
  <span className="flex gap-1" aria-label={`Nivel ${level} de 4`}>
    {[1, 2, 3, 4].map((i) => (
      <span key={i} className={`h-1.5 w-6 rounded-full ${i <= level ? (inverted ? "bg-black" : "bg-orange-500") : inverted ? "bg-black/20" : "bg-white/15"}`} />
    ))}
  </span>
);

/** Tipo de laptop elegido a mano: medidor, nombre, ejemplos reconocibles y el precio grande. */
const TierTile = ({ service, active, onClick }: { service: Service; active: boolean; onClick: () => void }) => {
  const t = TIER[service.id];
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${PRESS} flex flex-col text-left rounded-2xl p-5 min-h-[168px] ${active ? "bg-orange-500 text-black" : "bg-white/[0.04] hover:bg-white/[0.08] text-white"}`}
    >
      <Meter level={t.level} inverted={active} />
      <span className="mt-4 text-lg font-medium leading-tight">{service.name}</span>
      <span className={`mt-1 text-sm ${active ? "text-black/70" : "text-white/50"}`}>{t.examples}</span>
      <span className="mt-auto pt-4 text-3xl font-bold tracking-[-0.03em] tabular-nums">S/ {service.price}</span>
    </button>
  );
};

/** Buscador de modelo: escribe el código o nombre y clasificamos la laptop sola. */
const LaptopSearch = ({ onPick }: { onPick: (l: Laptop) => void }) => {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => {
    // La lista (~20 KB) solo se descarga si alguien elige laptop.
    import("@/data/laptops.json").then((m) => setLaptops(m.default));
  }, []);
  const results = searchLaptops(laptops, query);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Modelo de tu laptop</span>
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && results[0] && onPick(results[0])}
          placeholder="Escribe tu modelo: Strix G614JV, Legion 5…"
          className="w-full rounded-2xl bg-white/[0.07] focus:bg-white/[0.1] outline-none focus-visible:ring-2 focus-visible:ring-orange-500 pl-14 pr-4 py-4 text-lg text-white placeholder:text-white/35 transition-colors duration-150"
        />
      </label>
      <p className="mt-2 text-sm text-white/45">Está en la etiqueta debajo de la laptop. Te decimos qué tipo es.</p>
      {query.trim().length >= 2 && (
        <ul className="mt-4 space-y-2">
          {results.map((l) => {
            const s = findService(l.tier)!;
            return (
              <li key={laptopLabel(l)} className="animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={() => onPick(l)}
                  className={`${PRESS} w-full grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 text-left px-5 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09]`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm text-white/45">{l.brand}</span>
                    <span className="block text-white text-lg leading-tight truncate">{[l.name, l.code].filter(Boolean).join(" ")}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-xl font-bold tabular-nums text-white">S/ {s.price}</span>
                    <span className="block text-sm text-orange-400">{s.name}</span>
                  </span>
                </button>
              </li>
            );
          })}
          {results.length === 0 && <li className="text-white/50">No lo encontramos. Elige el tipo de laptop aquí abajo.</li>}
        </ul>
      )}
    </div>
  );
};

let nextKey = 1;

const QuoteSection = ({ initial }: { initial?: string }) => {
  const [mode, setMode] = useState<Mode>("mantenimiento");
  const [phase, setPhase] = useState(1);
  const [reached, setReached] = useState(1);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [model, setModel] = useState<Laptop | null>(null);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [gpuId, setGpuId] = useState<string | null>(null);
  const [cart, setCart] = useState<Saved[]>([]);
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.1 });

  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState("");

  // Los botones "Cotizar" de otras secciones (o ?equipo= en la URL, o la página de servicio) abren el cotizador con el equipo ya elegido.
  useEffect(() => {
    const preselect = (id: string) => {
      const repair = id === "reparacion";
      setMode(repair ? "reparacion" : "mantenimiento");
      setCategoryId(repair ? null : id);
      setServiceId(null);
      setModel(null);
      setExtraIds([]);
      setGpuId(null);
      setPhase(repair ? 1 : 2);
      setReached(repair ? 1 : 2);
    };
    const onQuote = (e: Event) => preselect((e as CustomEvent<string>).detail);
    const start = initial ?? new URLSearchParams(window.location.search).get("equipo");
    if (start === "reparacion" || maintenance.some((c) => c.id === start)) preselect(start!);
    // La fecha y el portal solo existen en el navegador (el HTML pregenerado no los lleva).
    setMounted(true);
    setToday(new Date().toLocaleDateString("es-PE"));
    window.addEventListener(QUOTE_EVENT, onQuote);
    return () => window.removeEventListener(QUOTE_EVENT, onQuote);
  }, [initial]);

  const service = findService(serviceId);
  const category = maintenance.find((c) => c.id === categoryId);
  const modelName = model ? laptopLabel(model) : undefined;
  const isRog = !!model?.name.startsWith("ROG");
  const draft: CartItem = { title: modelName ?? category?.name ?? "Diagnóstico", serviceId, extraIds, gpuId };
  const quote = buildCart([...cart, draft]);
  const draftLines = buildCart([draft]).groups.length > 0;

  const go = (n: number) => {
    setPhase(n);
    setReached((r) => Math.max(r, n));
  };

  const clearDraft = (m: Mode = mode) => {
    setMode(m);
    setPhase(1);
    setReached(1);
    setCategoryId(null);
    setServiceId(null);
    setModel(null);
    setExtraIds([]);
    setGpuId(null);
  };

  const pickCategory = (id: string) => {
    if (id !== categoryId) {
      setCategoryId(id);
      setServiceId(null);
      setModel(null);
      setExtraIds([]);
      setGpuId(null);
      setReached(2);
    }
    go(2);
  };

  const pickService = (s: Service, laptop: Laptop | null = null) => {
    setServiceId(s.id);
    setModel(laptop);
    setExtraIds([]);
    setGpuId(null);
    const next = hasPhase3(s) || laptop?.name.startsWith("ROG") ? 3 : 4;
    setReached(next);
    setPhase(next);
  };

  const toggleExtra = (id: string, group?: string) => {
    const sameGroup = new Set(service?.extras?.filter((e) => group && e.group === group).map((e) => e.id));
    setExtraIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids.filter((x) => !sameGroup.has(x)), id]));
  };

  /** Guarda el equipo en el ticket y vuelve a empezar para sumar otro. */
  const addAnother = () => {
    setCart((c) => [...c, { ...draft, key: nextKey++ }]);
    clearDraft();
  };

  const state = (n: number): PhaseState => (phase === n ? "open" : n <= reached ? "done" : "locked");
  const stageImg = (serviceId && SERVICE_IMG[serviceId]) || (categoryId && CATEGORY_IMG[categoryId]) || "";
  const showPhase3 = !service || hasPhase3(service) || isRog;
  const laptopTiers = category?.services.filter((s) => TIER[s.id]) ?? [];
  const rogPackage = findService(ROG_PACKAGE)!;
  const rogPicked = serviceId === ROG_PACKAGE && !model;

  return (
    <section
      id="cotizar"
      ref={sectionRef}
      className="py-24 pb-36 md:py-36 bg-[#0b0b0b] text-white"
      style={{ fontFamily: "var(--font-visual-sans, sans-serif)" }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-12">
          <h2 className="text-5xl md:text-7xl font-bold tracking-[-0.035em] leading-[0.95]">Arma tu ticket</h2>
          <p className="mt-5 max-w-xl text-lg text-white/70">Suma uno o varios equipos, mira el total al instante y envíalo por WhatsApp para agendar.</p>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-10 lg:gap-16 items-start">
          <div>
            <div className="inline-flex p-1 rounded-full bg-white/[0.06] mb-5">
              {(["mantenimiento", "reparacion"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => clearDraft(m)}
                  className={`${PRESS} px-5 py-2.5 rounded-full text-sm ${mode === m ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
                >
                  {m === "mantenimiento" ? "Mantenimiento" : "Reparación"}
                </button>
              ))}
            </div>

            {mode === "mantenimiento" ? (
              <div className="space-y-3">
                <Phase title={cart.length ? "¿Qué otro equipo traes?" : "¿Qué equipo traes?"} state={state(1)} summary={category?.name} onOpen={() => go(1)}>
                  <div className="grid grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {maintenance.map((c) => (
                      <PickCard key={c.id} active={c.id === categoryId} onClick={() => pickCategory(c.id)} img={CATEGORY_IMG[c.id]} title={c.name} caption={`Desde S/ ${fromPrice(c)}`} />
                    ))}
                  </div>
                </Phase>

                <Phase
                  title={categoryId === "laptops" ? "¿Cuál es tu laptop?" : "Elige el servicio"}
                  state={state(2)}
                  summary={modelName ?? service?.name}
                  onOpen={() => go(2)}
                >
                  {category &&
                    (categoryId === "laptops" ? (
                      <>
                        <LaptopSearch onPick={(l) => pickService(findService(l.tier)!, l)} />
                        <p className="mt-8 mb-3 text-white/70">¿No sabes el modelo? Elige el tipo:</p>
                        <div className="grid sm:grid-cols-2 gap-2.5">
                          {laptopTiers.map((s) => (
                            <TierTile key={s.id} service={s} active={s.id === serviceId && !model} onClick={() => pickService(s)} />
                          ))}
                        </div>
                        <button
                          type="button"
                          aria-pressed={rogPicked}
                          onClick={() => pickService(rogPackage)}
                          className={`${PRESS} mt-2.5 w-full grid grid-cols-[38%_minmax(0,1fr)] overflow-hidden rounded-2xl text-left ${
                            rogPicked ? "bg-orange-500 text-black" : "bg-white/[0.04] hover:bg-white/[0.08] text-white"
                          }`}
                        >
                          <OptimizedImage src={laptopGamerImg} alt="" width={320} height={240} sizes="200px" className="w-full h-full object-cover" />
                          <span className="p-5 flex flex-col">
                            <span className="text-lg font-medium leading-tight">{rogPackage.name}</span>
                            <span className={`mt-1 text-sm ${rogPicked ? "text-black/70" : "text-white/50"}`}>{rogPackage.detail}</span>
                            <span className="mt-auto pt-3 text-3xl font-bold tracking-[-0.03em] tabular-nums">
                              S/ {rogPackage.price} <s className="text-base font-normal opacity-50">{rogSeparate}</s>
                            </span>
                            <span className={`text-sm font-medium ${rogPicked ? "text-black" : "text-primary"}`}>Ahorras S/ {rogSaving}</span>
                          </span>
                        </button>
                      </>
                    ) : (
                      <>
                        <DeviceStage src={stageImg} title={service?.name ?? category.name} subtitle={service?.detail || "Elige una opción"} />
                        <div className="space-y-2">
                          {category.services.map((s) => (
                            <Row key={s.id} active={s.id === serviceId} onClick={() => pickService(s)} title={s.name} detail={s.detail} price={`S/ ${s.price}`} />
                          ))}
                        </div>
                      </>
                    ))}
                </Phase>

                {showPhase3 && (
                  <Phase title="Extras" state={state(3)} summary={extraIds.length || gpuId || serviceId === ROG_PACKAGE ? "Con extras" : "Sin extras"} onOpen={() => go(3)}>
                    {service && (
                      <>
                        <DeviceStage src={stageImg} title={modelName ?? service.name} subtitle={model ? `Tu laptop es ${tierName(model.tier)}` : service.detail} />

                        {isRog && (
                          <div className="mb-5">
                            <Row
                              active={serviceId === ROG_PACKAGE}
                              onClick={() => {
                                setServiceId(serviceId === ROG_PACKAGE ? model!.tier : ROG_PACKAGE);
                                setExtraIds([]);
                              }}
                              title="Paquete completo ROG"
                              detail={`${rogPackage.detail} · ahorras S/ ${rogSaving}`}
                              price={
                                <>
                                  <s className="mr-2 text-white/40">{rogSeparate}</s>S/ {rogPackage.price}
                                </>
                              }
                            />
                          </div>
                        )}

                        {service.extras && (
                          <div className="space-y-2">
                            <p className="text-white/60 mb-2">Opcional, puedes marcar varios:</p>
                            {service.extras.map((e) => (
                              <Row key={e.id} multi active={extraIds.includes(e.id)} onClick={() => toggleExtra(e.id, e.group)} title={e.name} price={`+ S/ ${e.price}`} />
                            ))}
                          </div>
                        )}

                        {service.gpuCombo && (
                          <div className="space-y-2 mt-6">
                            <p className="text-white/80 mb-2">
                              ¿También tu tarjeta gráfica? <span className="text-orange-400">20% menos en combo</span>
                            </p>
                            <Row active={!gpuId} onClick={() => setGpuId(null)} title="No, solo la PC" />
                            {gpus.map((g) => (
                              <Row
                                key={g.id}
                                active={g.id === gpuId}
                                onClick={() => setGpuId(g.id)}
                                title={g.name}
                                detail={g.detail}
                                price={
                                  g.comboPrice ? (
                                    <>
                                      <s className="mr-2 text-white/40">{g.price}</s>+ S/ {g.comboPrice}
                                    </>
                                  ) : (
                                    `+ S/ ${g.price}`
                                  )
                                }
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </Phase>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Phase title="¿Qué diagnóstico necesitas?" state={phase === 1 ? "open" : "done"} summary={service?.name} onOpen={() => go(1)}>
                  <div className="grid grid-cols-2 gap-2.5">
                    {diagnosis.map((s) => (
                      <PickCard key={s.id} active={s.id === serviceId} onClick={() => pickService(s)} img={SERVICE_IMG[s.id]} title={s.name} caption={`S/ ${s.price}`} />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-white/50">Es el costo del diagnóstico. La reparación se cotiza después de revisar el equipo, y si reparas conmigo el diagnóstico se descuenta.</p>
                </Phase>
                <Reveal show={!!service && phase > 1}>
                  {service && <DeviceStage src={SERVICE_IMG[service.id]} title={service.name} subtitle={service.detail} />}
                </Reveal>
              </div>
            )}

            <Reveal show={draftLines}>
              <button
                type="button"
                onClick={addAnother}
                className={`${PRESS} mt-4 w-full flex items-center justify-center gap-2 rounded-full bg-white/[0.07] hover:bg-white/[0.12] text-white py-4`}
              >
                <Plus className="w-5 h-5" aria-hidden="true" />
                Agregar otro equipo al ticket
              </button>
            </Reveal>
          </div>

          <aside className="lg:sticky lg:top-24" aria-live="polite">
            {/* El ticket térmico es el objeto del negocio: su tipografía mono y sus cortes punteados son parte del artefacto. */}
            <div data-ui className="bg-[#f3f3f1] text-zinc-900 px-6 pt-7 pb-10 font-mono text-[13px]" style={{ clipPath: TEAR }}> {/* taste-skill-ignore: el ticket es el artefacto */}
              <p className="text-center text-base font-bold tracking-[0.2em]">QUICKFIX.PE</p>
              <p className="text-center text-zinc-500 text-xs mt-1">
                San Miguel, Lima
                <br />
                COTIZACIÓN{today && ` · ${today}`}
              </p>

              {quote.groups.length === 0 ? (
                <>
                  <hr className="my-4 border-0 border-t border-dashed border-zinc-400" /> {/* taste-skill-ignore: corte del ticket */}
                  <p className="text-center text-zinc-400 py-6">Elige un equipo</p>
                </>
              ) : (
                quote.groups.map((g, i) => {
                  const saved = cart[i];
                  return (
                    <div key={saved?.key ?? "draft"} className="animate-in fade-in slide-in-from-top-1">
                      <hr className="my-4 border-0 border-t border-dashed border-zinc-400" /> {/* taste-skill-ignore: corte del ticket */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="font-bold uppercase truncate">{g.title}</p>
                        {saved ? (
                          <button
                            type="button"
                            onClick={() => setCart((c) => c.filter((x) => x.key !== saved.key))}
                            aria-label={`Quitar ${g.title}`}
                            className={`${PRESS} shrink-0 grid place-items-center w-7 h-7 rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900`}
                          >
                            <X className="w-4 h-4" aria-hidden="true" />
                          </button>
                        ) : (
                          cart.length > 0 && <span className="shrink-0 text-xs text-orange-600">armando</span>
                        )}
                      </div>
                      <ul className="space-y-1.5">
                        {g.lines.map((l) => (
                          <li key={l.label} className={`flex justify-between gap-3 ${l.muted ? "text-zinc-500" : ""}`}>
                            <span>{l.label}</span>
                            <span className="tabular-nums shrink-0">{l.price.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              )}

              <hr className="my-4 border-0 border-t border-dashed border-zinc-400" /> {/* taste-skill-ignore: corte del ticket */}
              <p className="flex justify-between text-base font-bold">
                <span>TOTAL</span>
                <span className="tabular-nums">{formatSoles(quote.total)}</span>
              </p>
              <hr className="my-4 border-0 border-t border-dashed border-zinc-400" /> {/* taste-skill-ignore: corte del ticket */}
              <p className="text-center text-zinc-500 text-xs">Precio referencial.<br />Se confirma al revisar el equipo.</p>
            </div>

            {quote.groups.length > 0 ? (
              <a
                href={whatsappUrl(quote)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${PRESS} mt-5 flex items-center justify-center gap-2 w-full rounded-full bg-orange-500 hover:bg-orange-400 text-black font-medium py-4`}
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                Enviar ticket por WhatsApp
              </a>
            ) : (
              <p className="mt-5 text-center text-white/40">Elige un equipo para armar tu ticket.</p>
            )}
          </aside>
        </div>
      </div>

      {/* Barra fija en móvil: el ticket queda al final de la sección, así que el total y el botón siempre están a mano.
          Va en un portal porque el contenedor con content-visibility de Index rompe position: fixed. */}
      {mounted && createPortal(
        <AnimatePresence>
          {inView && quote.groups.length > 0 && (
            <motion.div
              initial={{ transform: reduce ? "translateY(0%)" : "translateY(100%)", opacity: reduce ? 0 : 1 }}
              animate={{ transform: "translateY(0%)", opacity: 1 }}
              exit={{ transform: reduce ? "translateY(0%)" : "translateY(100%)", opacity: reduce ? 0 : 1 }}
              transition={reduce ? { duration: 0.2 } : SPRING}
              className="qf-bar lg:hidden fixed inset-x-0 bottom-0 z-[70] bg-[#141414] text-white px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/60">
                  {quote.groups.length} {quote.groups.length === 1 ? "equipo" : "equipos"} · total
                </p>
                <p className="text-xl font-bold tabular-nums">{formatSoles(quote.total)}</p>
              </div>
              <a
                href={whatsappUrl(quote)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${PRESS} flex items-center gap-2 rounded-full bg-orange-500 text-black font-medium px-5 py-3`}
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                WhatsApp
              </a>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
};

export default QuoteSection;
