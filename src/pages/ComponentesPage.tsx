import { useEffect, useMemo, useRef, useState } from "react";
import { ImageOff, Minus, Plus, Search, ShoppingBag, Trash2, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { track } from "@/lib/analytics";
import { waLink } from "@/lib/site";
import {
  CATALOGO_URL, DISTRITOS, PEDIDO_MINIMO, armarPedido, instalacionesPara, maximo, mensajePedido, soles,
  type Entrega, type ItemPedido, type Producto,
} from "@/lib/componentes";

const PRESS =
  "transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";
const POR_PAGINA = 24;
const CARRITO_KEY = "qf-carrito";

const normal = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const fecha = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "short" });

const Stock = ({ p, corto = false }: { p: Producto; corto?: boolean }) => {
  // cantidad puede faltar en un catálogo publicado antes de que el sync la incluyera.
  const n = p.cantidad;
  const unidades = n === undefined ? null : `${p.hayMas ? "+" : ""}${n}${corto ? "" : n === 1 && !p.hayMas ? " unidad" : " unidades"}`;
  const [color, texto] =
    p.stock === "stock"
      ? ["bg-[#3ecf8e]", `${unidades ? `${unidades} en stock` : "En stock"}${corto ? "" : " · entrega en 24 a 48 h"}`]
      : p.stock === "pocas"
        ? ["bg-[#f5a524]", unidades ? `Solo ${unidades}` : "Pocas unidades"]
        : ["bg-white/40", `${corto ? "" : "Sin stock en Lima · "}Llega el ${p.llega ? fecha(p.llega) : "pronto"}`];
  return (
    <span className="flex items-center gap-2 text-sm text-white/70">
      <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} aria-hidden="true" />
      {texto}
    </span>
  );
};

/** Foto del producto o, si Deltron no tiene, un recuadro con la marca (en miniatura, solo la inicial). */
const Foto = ({ src, alt, p, mini = false, className = "" }: { src: string | null; alt: string; p: Producto; mini?: boolean; className?: string }) =>
  src ? (
    <div className={`overflow-hidden bg-[#f2f2f2] ${className}`}>
      <img src={src} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-contain p-4 mix-blend-multiply" />
    </div>
  ) : mini ? (
    <div className={`grid place-items-center bg-white/[0.06] font-display text-2xl font-bold text-white/70 ${className}`} aria-hidden="true">
      {(p.marca || p.categoria).charAt(0)}
    </div>
  ) : (
    <div className={`flex flex-col justify-between bg-white/[0.06] p-4 ${className}`} role="img" aria-label={`${p.marca || p.categoria}: sin vista previa disponible`}>
      <span className="text-xs text-white/50">{p.marca ? p.categoria : ""}</span>
      <span className="break-words font-display text-2xl font-bold uppercase leading-none tracking-[-0.03em] text-white md:text-3xl">{p.marca || p.categoria}</span>
      <span className="flex items-center gap-1.5 text-xs text-white/50">
        <ImageOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Sin vista previa disponible
      </span>
    </div>
  );

/** Ventana modal nativa: Escape y foco los maneja el navegador. */
function Modal({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 mt-auto max-h-[92svh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-[#0b0b0b] p-0 text-white backdrop:bg-black/70 sm:m-auto sm:max-w-3xl sm:rounded-3xl"
    >
      <button type="button" onClick={onClose} aria-label="Cerrar" className={`${PRESS} absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/[0.08] hover:bg-white/[0.14]`}>
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
      {open && children}
    </dialog>
  );
}

const ComponentesPage = () => {
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todo");
  const [orden, setOrden] = useState("relevancia");
  const [visibles, setVisibles] = useState(POR_PAGINA);
  const [detalle, setDetalle] = useState<string | null>(null);
  const [carrito, setCarrito] = useState<ItemPedido[]>([]);
  const [verPedido, setVerPedido] = useState(false);
  const [conMantenimiento, setConMantenimiento] = useState(false);
  const [entrega, setEntrega] = useState<Entrega>({ modo: "taller" });

  useEffect(() => {
    const cargar = import.meta.env.DEV
      ? import("@/data/componentes.sample.json").then((m) => m.default)
      : fetch(CATALOGO_URL, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
    cargar.then((d: { productos: Producto[] }) => setProductos(d.productos)).catch(() => setError(true));
    try {
      setCarrito(JSON.parse(localStorage.getItem(CARRITO_KEY) || "[]"));
    } catch {
      /* sin almacenamiento: carrito vacío */
    }
    setDetalle(new URLSearchParams(location.search).get("sku"));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    } catch {
      /* modo privado */
    }
  }, [carrito]);

  // ?sku= en la URL para poder compartir un producto.
  const abrir = (sku: string | null) => {
    setDetalle(sku);
    history.replaceState(null, "", sku ? `?sku=${encodeURIComponent(sku)}` : location.pathname);
  };

  const porSku = useMemo(() => new Map((productos ?? []).map((p) => [p.sku, p])), [productos]);
  const categorias = useMemo(() => ["Todo", ...new Set((productos ?? []).map((p) => p.categoria))], [productos]);
  const lista = useMemo(() => {
    const palabras = normal(q).split(/\s+/).filter(Boolean);
    const r = (productos ?? []).filter(
      (p) => (cat === "Todo" || p.categoria === cat) && palabras.every((w) => normal(`${p.nombre} ${p.marca} ${p.pn} ${p.sku} ${p.subcategoria}`).includes(w)),
    );
    if (orden === "menor") r.sort((a, b) => a.precio - b.precio);
    if (orden === "mayor") r.sort((a, b) => b.precio - a.precio);
    return r;
  }, [productos, q, cat, orden]);

  const agregar = (sku: string, cantidad = 1, instalacion: string | null = null) => {
    track("componentes_agregar", { sku });
    setCarrito((c) => {
      const i = c.findIndex((it) => it.sku === sku);
      if (i === -1) return [...c, { sku, cantidad, instalacion }];
      return c.map((it, j) => (j === i ? { ...it, cantidad: Math.min(maximo(porSku.get(sku)!), it.cantidad + cantidad), instalacion: instalacion ?? it.instalacion } : it));
    });
  };
  const cambiar = (sku: string, cambio: Partial<ItemPedido>) =>
    setCarrito((c) => c.map((it) => (it.sku === sku ? { ...it, ...cambio } : it)).filter((it) => it.cantidad > 0));

  const enCarrito = carrito.filter((it) => porSku.has(it.sku));
  const pedido = armarPedido(enCarrito, porSku, conMantenimiento, entrega);
  const unidades = enCarrito.reduce((s, it) => s + it.cantidad, 0);
  const actual = detalle ? porSku.get(detalle) : undefined;

  return (
    <div className="relative min-h-[100svh] w-full overflow-x-clip bg-[#050505]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-36 pt-[120px] md:px-8 md:pt-[150px]">
        <nav aria-label="Ruta" className="text-white/60">
          <a href="/" className="hover:text-white">Inicio</a> <span aria-hidden="true">/</span> <span className="text-white/80">Componentes</span>
        </nav>
        <h1 className="mt-6 text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">Componentes</h1>
        <p className="mt-6 max-w-[56ch] text-xl leading-relaxed text-white/80">
          Upgrades para tu laptop o PC, laptops, monitores y periféricos. Si quieres, te lo instalo y lo pruebo antes de entregártelo.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2 text-white/80">
          {["Precio final en soles", "Garantía de fábrica", "Instalación opcional", "Delivery en Lima"].map((t) => (
            <li key={t} className="rounded-full bg-white/[0.06] px-4 py-2">{t}</li>
          ))}
        </ul>

        <div className="sticky top-[72px] z-30 -mx-5 mt-14 bg-[#050505] px-5 pb-4 pt-2 md:-mx-8 md:px-8">
          <div>
            <label className="relative block">
              <span className="sr-only">Buscar componentes</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" aria-hidden="true" />
              <input
                type="search"
                value={q}
                onChange={(e) => { setQ(e.target.value); setVisibles(POR_PAGINA); }}
                placeholder="Modelo, marca o número de parte"
                className="h-12 w-full rounded-full bg-white/[0.06] pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>
          <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Categorías">
            {categorias.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={cat === c}
                onClick={() => { setCat(c); setVisibles(POR_PAGINA); }}
                className={`${PRESS} shrink-0 rounded-full px-4 py-2 ${cat === c ? "bg-primary text-black" : "bg-white/[0.06] text-white/80 hover:bg-white/[0.12]"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="mt-10 rounded-3xl bg-white/[0.04] p-8">
            <p className="text-2xl font-bold text-white">El catálogo se está actualizando</p>
            <p className="mt-2 text-lg text-white/70">Escríbeme qué componente buscas y te paso precio y stock al momento.</p>
            <a href={waLink("Hola QuickFix, busco este componente: ")} target="_blank" rel="noopener noreferrer" className={`${PRESS} mt-6 inline-flex rounded-full bg-primary px-6 py-3.5 font-medium text-black`}>
              Preguntar por WhatsApp
            </a>
          </div>
        ) : !productos ? (
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4" aria-label="Cargando catálogo">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-white/[0.04]" />
            ))}
          </ul>
        ) : (
          <>
            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-white/60" aria-live="polite">{lista.length} productos</p>
              <label>
                <span className="sr-only">Ordenar</span>
                <select value={orden} onChange={(e) => setOrden(e.target.value)} className="h-10 rounded-full bg-white/[0.06] px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="relevancia">Destacados</option>
                  <option value="menor">Menor precio</option>
                  <option value="mayor">Mayor precio</option>
                </select>
              </label>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {lista.slice(0, visibles).map((p) => (
                <li key={p.sku} className="flex flex-col overflow-hidden rounded-3xl bg-white/[0.04]">
                  <button type="button" onClick={() => abrir(p.sku)} className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
                    <Foto src={p.imagen} alt={p.nombre} p={p} className="aspect-square transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:scale-[1.02]" />
                    <span className="block px-4 pt-4 font-mono text-xs uppercase tracking-wide text-white/50">{[p.marca, p.pn].filter(Boolean).join(" · ")}</span>
                    <span className="mt-1 line-clamp-3 px-4 leading-snug text-white">{p.nombre}</span>
                  </button>
                  <div className="mt-auto px-4 pb-4 pt-4">
                    <p className="font-display text-2xl font-bold tracking-[-0.02em] text-white tabular-nums md:text-3xl">{soles(p.precio)}</p>
                    <div className="mt-1"><Stock p={p} corto /></div>
                    <button type="button" onClick={() => agregar(p.sku)} className={`${PRESS} mt-4 w-full rounded-full bg-primary py-2.5 font-medium text-black hover:bg-[#ff7a1f]`}>
                      Agregar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {lista.length === 0 && (
              <p className="mt-10 text-lg text-white/70">
                No encontré "{q}". <a href={waLink(`Hola QuickFix, busco: ${q}`)} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">Pregúntame por WhatsApp</a>, puedo conseguirlo.
              </p>
            )}
            {visibles < lista.length && (
              <button type="button" onClick={() => setVisibles((v) => v + POR_PAGINA)} className={`${PRESS} mx-auto mt-10 block rounded-full bg-white/[0.08] px-8 py-3.5 text-white hover:bg-white/[0.14]`}>
                Ver más ({lista.length - visibles})
              </button>
            )}
          </>
        )}

        <p className="mt-16 max-w-[70ch] text-white/60">
          Precios finales en soles. No emito boleta ni factura. Confirmo el stock antes de que pagues y compro el producto con tu pago; la garantía es la del fabricante y yo me encargo del trámite.
          {" "}<a href="/terminos/" className="text-white/80 underline underline-offset-4">Términos</a>
        </p>
      </main>

      {unidades > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-3 md:p-5">
          <button
            type="button"
            onClick={() => setVerPedido(true)}
            className={`${PRESS} mx-auto flex w-full max-w-xl items-center justify-between gap-4 rounded-full bg-primary py-3 pl-6 pr-3 text-black`}
          >
            <span className="flex items-center gap-3 font-medium">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              Tu pedido · {unidades} {unidades === 1 ? "producto" : "productos"}
            </span>
            <span className="rounded-full bg-black px-4 py-2 font-display font-bold text-white tabular-nums">{soles(pedido.total)}</span>
          </button>
        </div>
      )}

      <Modal open={!!actual} onClose={() => abrir(null)} label={actual?.nombre ?? "Producto"}>
        {actual && <Ficha p={actual} onAgregar={(cantidad, inst) => { agregar(actual.sku, cantidad, inst); abrir(null); }} />}
      </Modal>

      <Modal open={verPedido} onClose={() => setVerPedido(false)} label="Tu pedido">
        <div className="p-6 md:p-10">
          <h2 className="pr-12 text-4xl font-bold tracking-[-0.035em]">Tu pedido</h2>
          <ul className="mt-6 divide-y divide-white/[0.08]">
            {enCarrito.map((it) => {
              const p = porSku.get(it.sku)!;
              const opciones = instalacionesPara(p);
              return (
                <li key={it.sku} className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 py-4">
                  <Foto src={p.imagen} alt="" p={p} mini className="h-16 w-16 rounded-xl" />
                  <div>
                    <p className="leading-snug">{p.nombre}</p>
                    <p className="font-mono text-xs text-white/50">{p.pn}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-full bg-white/[0.06]">
                        <button type="button" aria-label="Quitar uno" onClick={() => cambiar(it.sku, { cantidad: it.cantidad - 1 })} className={`${PRESS} grid h-10 w-10 place-items-center rounded-full`}>
                          {it.cantidad === 1 ? <Trash2 className="h-4 w-4" aria-hidden="true" /> : <Minus className="h-4 w-4" aria-hidden="true" />}
                        </button>
                        <span className="w-6 text-center tabular-nums" aria-label={`${it.cantidad} unidades`}>{it.cantidad}</span>
                        <button type="button" aria-label="Agregar uno" onClick={() => cambiar(it.sku, { cantidad: Math.min(maximo(p), it.cantidad + 1) })} className={`${PRESS} grid h-10 w-10 place-items-center rounded-full`}>
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="font-display font-bold tabular-nums">{soles(p.precio * it.cantidad)}</span>
                    </div>
                    {opciones.length > 0 && (
                      <label className="mt-3 block">
                        <span className="sr-only">Instalación</span>
                        <select
                          value={it.instalacion ?? ""}
                          onChange={(e) => cambiar(it.sku, { instalacion: e.target.value || null })}
                          className="h-11 w-full rounded-xl bg-white/[0.06] px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Sin instalación</option>
                          {opciones.map((o) => (
                            <option key={o.id} value={o.id}>{o.nombre} · {soles(conMantenimiento ? o.conMantenimiento : o.precio)}</option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <label className="mt-4 flex cursor-pointer gap-3 rounded-2xl bg-white/[0.04] p-4">
            <input type="checkbox" checked={conMantenimiento} onChange={(e) => setConMantenimiento(e.target.checked)} className="mt-1 h-5 w-5 accent-[#FF6600]" />
            <span>
              <span className="block">Lo sumo a un mantenimiento</span>
              <span className="text-white/60">Instalación de RAM y SSD gratis, el resto a mitad de precio y sin pedido mínimo.</span>
            </span>
          </label>

          <fieldset className="mt-6">
            <legend className="text-lg font-medium">¿Cómo lo recibes?</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(["taller", "delivery"] as const).map((m) => (
                <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-2xl p-4 ${entrega.modo === m ? "bg-white/[0.1] ring-2 ring-primary" : "bg-white/[0.04]"}`}>
                  <input
                    type="radio"
                    name="entrega"
                    checked={entrega.modo === m}
                    onChange={() => setEntrega(m === "taller" ? { modo: "taller" } : { modo: "delivery", distrito: DISTRITOS[0] })}
                    className="h-5 w-5 accent-[#FF6600]"
                  />
                  <span>{m === "taller" ? "Recojo en el taller · gratis" : "Delivery en Lima"}</span>
                </label>
              ))}
            </div>
            {entrega.modo === "delivery" && (
              <label className="mt-3 block">
                <span className="text-white/70">Distrito</span>
                <select
                  value={entrega.distrito}
                  onChange={(e) => setEntrega({ modo: "delivery", distrito: e.target.value })}
                  className="mt-1 h-11 w-full rounded-xl bg-white/[0.06] px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {DISTRITOS.map((d) => <option key={d}>{d}</option>)}
                  <option value="Otro distrito">Otro distrito (a coordinar)</option>
                </select>
              </label>
            )}
          </fieldset>

          <dl className="mt-6 space-y-1 border-t border-white/[0.08] pt-4">
            {pedido.lineas.map((l, i) => (
              <div key={i} className="flex justify-between gap-4 text-white/70">
                <dt className="min-w-0">{l.label}</dt>
                <dd className="shrink-0 tabular-nums">{soles(l.precio)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 pt-3 text-2xl font-bold">
              <dt>Total</dt>
              <dd className="font-display tabular-nums">{soles(pedido.total)}{pedido.movilidadACoordinar ? " + movilidad" : ""}</dd>
            </div>
          </dl>

          {pedido.falta > 0 ? (
            <p className="mt-6 rounded-2xl bg-white/[0.06] p-4 text-white/80">
              El pedido mínimo es de {soles(PEDIDO_MINIMO)} en productos. Agrega {soles(pedido.falta)} más o súmalo a un mantenimiento.
            </p>
          ) : (
            <a
              href={waLink(mensajePedido(enCarrito, porSku, conMantenimiento, entrega))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("enviar_pedido_componentes", { total: pedido.total, productos: unidades })}
              className={`${PRESS} mt-6 flex justify-center rounded-full bg-primary py-4 text-lg font-medium text-black hover:bg-[#ff7a1f]`}
            >
              Enviar pedido por WhatsApp
            </a>
          )}
          <p className="mt-4 text-sm text-white/60">Precio final. No emito boleta ni factura. Te confirmo el stock antes de que pagues.</p>
        </div>
      </Modal>
    </div>
  );
};

function Ficha({ p, onAgregar }: { p: Producto; onAgregar: (cantidad: number, instalacion: string | null) => void }) {
  const fotos = p.fotos.length ? p.fotos : [p.imagen];
  const [foto, setFoto] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const opciones = instalacionesPara(p);
  const [inst, setInst] = useState<string | null>(null);
  const extra = opciones.find((o) => o.id === inst)?.precio ?? 0;

  return (
    <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
      <div>
        <Foto src={fotos[foto] ?? null} alt={p.nombre} p={p} className="aspect-square rounded-2xl" />
        {fotos.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {fotos.map((f, i) => (
              <button key={i} type="button" onClick={() => setFoto(i)} aria-label={`Foto ${i + 1}`} aria-pressed={foto === i} className={`shrink-0 rounded-xl ${foto === i ? "ring-2 ring-primary" : ""}`}>
                <Foto src={f} alt="" p={p} mini className="h-16 w-16 rounded-xl" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-white/50">{[p.marca, p.pn].filter(Boolean).join(" · ")}</p>
        <h2 className="mt-2 pr-10 text-3xl font-bold leading-[1.05] tracking-[-0.03em]">{p.nombre}</h2>
        <p className="mt-4 font-display text-5xl font-bold tracking-[-0.03em] tabular-nums">{soles(p.precio)}</p>
        <div className="mt-2"><Stock p={p} /></div>

        {opciones.length > 0 && (
          <fieldset className="mt-6">
            <legend className="text-white/70">¿Te lo instalo?</legend>
            <div className="mt-2 space-y-2">
              {[null, ...opciones].map((o) => (
                <label key={o?.id ?? "no"} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 ${inst === (o?.id ?? null) ? "bg-white/[0.1] ring-2 ring-primary" : "bg-white/[0.04]"}`}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="instalacion" checked={inst === (o?.id ?? null)} onChange={() => setInst(o?.id ?? null)} className="h-5 w-5 accent-[#FF6600]" />
                    {o ? o.nombre : "No, solo el producto"}
                  </span>
                  {o && <span className="shrink-0 tabular-nums text-white/70">+ {soles(o.precio)}</span>}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-6 flex gap-3">
          <div className="flex items-center rounded-full bg-white/[0.06]">
            <button type="button" aria-label="Menos" onClick={() => setCantidad((c) => Math.max(1, c - 1))} className={`${PRESS} grid h-12 w-12 place-items-center rounded-full`}>
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="w-6 text-center tabular-nums" aria-live="polite">{cantidad}</span>
            <button type="button" aria-label="Más" onClick={() => setCantidad((c) => Math.min(maximo(p), c + 1))} className={`${PRESS} grid h-12 w-12 place-items-center rounded-full`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <button type="button" onClick={() => onAgregar(cantidad, inst)} className={`${PRESS} flex-1 rounded-full bg-primary py-3 font-medium text-black hover:bg-[#ff7a1f]`}>
            Agregar · {soles((p.precio + extra) * cantidad)}
          </button>
        </div>

        {Object.keys(p.specs).length > 0 && (
          <dl className="mt-8">
            {Object.entries(p.specs).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 border-t border-white/[0.08] py-2.5">
                <dt className="text-white/55">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-6 border-t border-white/[0.08] py-2.5">
              <dt className="text-white/55">Garantía</dt>
              <dd className="text-right">{p.garantia}</dd>
            </div>
          </dl>
        )}
        {p.descripcion && <p className="mt-6 text-white/70">{p.descripcion}</p>}
      </div>
    </div>
  );
}

export default ComponentesPage;
