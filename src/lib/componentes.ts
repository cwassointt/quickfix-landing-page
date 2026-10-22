import { homeVisit } from "@/data/catalog";
import { travelFor } from "@/lib/quote";

/** Producto tal como lo publica server/deltron/sync.php en /data/componentes.json (precio final en soles). */
export type Producto = {
  sku: string;
  pn: string;
  nombre: string;
  descripcion: string;
  marca: string;
  categoria: string;
  subcategoria: string;
  garantia: string;
  precio: number;
  stock: "stock" | "pocas" | "transito";
  llega: string | null;
  imagen: string | null;
  fotos: string[];
  specs: Record<string, string>;
};

export const CATALOGO_URL = "/data/componentes.json";
export const PEDIDO_MINIMO = 150;

export type Instalacion = { id: string; nombre: string; precio: number; conMantenimiento: number };
const op = (id: string, nombre: string, precio: number, conMantenimiento: number): Instalacion => ({ id, nombre, precio, conMantenimiento });
const disco = [op("instalar", "Solo instalación", 30, 0), op("clonar", "Instalación + clonar mi disco", 70, 40), op("windows", "Instalación + Windows limpio y drivers", 70, 40)];

// Mano de obra según la categoría que publica server/deltron/sync.php (CATEGORIAS). Las demás no llevan instalación.
const INSTALACION: Record<string, Instalacion[]> = {
  Laptops: [op("config", "Configuración inicial (Windows, drivers, sin programas basura)", 50, 50)],
  Procesadores: [op("instalar", "Instalación + pasta + actualizar BIOS", 60, 30)],
  "Placas madre": [op("instalar", "Cambio de placa (desarmar y armar)", 120, 80)],
  "Memorias RAM": [op("instalar", "Instalación", 30, 0)],
  SSD: disco,
  "Discos duros": disco,
  Fuentes: [op("instalar", "Instalación con reordenado de cables", 60, 30)],
  Cases: [op("instalar", "Pasar tu PC al case nuevo", 70, 50)],
  Refrigeración: [op("instalar", "Instalación del cooler", 50, 25)],
};
const LIQUIDA = [op("instalar", "Instalación de refrigeración líquida", 80, 40)];

export const instalacionesPara = (p: Pick<Producto, "categoria" | "subcategoria">) =>
  p.categoria === "Refrigeración" && /l[ií]quido/i.test(p.subcategoria) ? LIQUIDA : (INSTALACION[p.categoria] ?? []);

export type ItemPedido = { sku: string; cantidad: number; instalacion: string | null };
export type Entrega = { modo: "taller" } | { modo: "delivery"; distrito: string };
export type Linea = { label: string; precio: number };

export const DISTRITOS = homeVisit.zones.flatMap((z) => z.districts).sort((a, b) => a.localeCompare(b, "es"));

/** Arma el pedido: productos, mano de obra, movilidad y si cumple el mínimo. */
export function armarPedido(items: ItemPedido[], productos: Map<string, Producto>, conMantenimiento: boolean, entrega: Entrega) {
  const lineas: Linea[] = [];
  let productosTotal = 0;
  for (const it of items) {
    const p = productos.get(it.sku);
    if (!p || it.cantidad < 1) continue;
    lineas.push({ label: `${it.cantidad} × ${p.nombre}`, precio: p.precio * it.cantidad });
    productosTotal += p.precio * it.cantidad;
    const inst = instalacionesPara(p).find((o) => o.id === it.instalacion);
    if (inst) lineas.push({ label: `${inst.nombre}${it.cantidad > 1 ? ` × ${it.cantidad}` : ""}`, precio: (conMantenimiento ? inst.conMantenimiento : inst.precio) * it.cantidad });
  }
  const movilidad = entrega.modo === "delivery" ? travelFor(entrega.distrito) : 0;
  if (entrega.modo === "delivery") lineas.push({ label: `Delivery · ${entrega.distrito}`, precio: movilidad ?? 0 });
  const falta = conMantenimiento ? 0 : Math.max(0, PEDIDO_MINIMO - productosTotal);
  return { lineas, productosTotal, total: lineas.reduce((s, l) => s + l.precio, 0), falta, movilidadACoordinar: movilidad === undefined };
}

export const soles = (n: number) => `S/ ${n.toLocaleString("es-PE")}`;

export function mensajePedido(items: ItemPedido[], productos: Map<string, Producto>, conMantenimiento: boolean, entrega: Entrega) {
  const pedido = armarPedido(items, productos, conMantenimiento, entrega);
  const skus = items.map((it) => productos.get(it.sku)).filter((p): p is Producto => !!p).map((p) => `${p.sku} · ${p.pn}`);
  return [
    "Hola QuickFix, quiero comprar estos componentes:",
    "",
    ...pedido.lineas.map((l) => `• ${l.label}: ${soles(l.precio)}`),
    "",
    `Total: ${soles(pedido.total)}${pedido.movilidadACoordinar ? " + movilidad a coordinar" : ""}`,
    conMantenimiento ? "Lo sumo a un mantenimiento." : "",
    entrega.modo === "taller" ? "Lo recojo en el taller (San Miguel)." : "",
    "",
    `Códigos: ${skus.join(", ")}`,
    "¿Me confirmas el stock para hacer el pago?",
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");
}
