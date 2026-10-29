import { GPU_COMBO_DISCOUNT, diagnosis, homeVisit, maintenance } from "@/data/catalog";

export const WHATSAPP_NUMBER = "51940755119";

export type Selection = { serviceId: string | null; extraIds: string[]; gpuId: string | null };
export type Line = { label: string; price: number; muted?: boolean };

const services = [...maintenance.flatMap((c) => c.services), ...diagnosis];

export const findService = (id: string | null) => services.find((s) => s.id === id);

const gpuIds = new Set(maintenance.find((c) => c.id === "gpus")!.services.map((s) => s.id));
/** Los extras de la GPU elegida dentro del combo van en extraIds con este prefijo, para no chocar con los de la PC. */
export const gpuExtra = (id: string) => `gpu:${id}`;
const comboLine = (gpuPrice: number): Line => ({ label: `Dscto. combo PC + GPU (${GPU_COMBO_DISCOUNT * 100}%)`, price: -gpuPrice * GPU_COMBO_DISCOUNT, muted: true });

/** comboPc: el ticket ya tiene una PC gamer, así que una GPU agregada como otro equipo también lleva el descuento. */
export function buildQuote({ serviceId, extraIds, gpuId }: Selection, comboPc = false) {
  const service = findService(serviceId);
  const lines: Line[] = [];
  if (service) {
    lines.push({ label: service.name, price: service.price });
    for (const extra of service.extras ?? []) {
      if (extraIds.includes(extra.id)) lines.push({ label: `+ ${extra.name}`, price: extra.price });
    }
    if (comboPc && gpuIds.has(service.id)) lines.push(comboLine(service.price));
    const gpu = service.gpuCombo ? findService(gpuId) : undefined;
    if (gpu) {
      lines.push({ label: `+ GPU ${gpu.detail.split(" · ")[0]}`, price: gpu.price });
      for (const extra of gpu.extras ?? []) {
        if (extraIds.includes(gpuExtra(extra.id))) lines.push({ label: `+ GPU: ${extra.name}`, price: extra.price });
      }
      lines.push(comboLine(gpu.price));
    }
  }
  return { lines, total: lines.reduce((sum, l) => sum + l.price, 0) };
}

export const formatSoles = (n: number) => `S/ ${n.toFixed(2)}`;

/** Un equipo del carrito; `title` es lo que se lee arriba de sus líneas en el ticket (modelo o tipo de equipo). */
export type CartItem = Selection & { title: string; categoryId?: string };

/**
 * Dónde se atiende el pedido (una vez por pedido):
 * - domicilio: voy, lo hago en tu casa → visita + movilidad
 * - recojo: recojo el equipo y lo llevo al taller → solo movilidad
 */
export type Visit = { mode: "domicilio" | "recojo"; district: string };

/** Qué obliga a atender en el taller: un diagnóstico o la PC gamer. null = se puede ir a domicilio. */
export function tallerReason(items: CartItem[]): "diagnostico" | "pc-gamer" | null {
  if (items.some((i) => diagnosis.some((d) => d.id === i.serviceId))) return "diagnostico";
  if (items.some((i) => findService(i.serviceId)?.tallerOnly)) return "pc-gamer";
  return null;
}
export const homeVisitAllowed = (items: CartItem[]) => tallerReason(items) === null;

/** Movilidad de un distrito, o undefined si no está en las zonas atendidas. */
export const travelFor = (district: string) => homeVisit.zones.find((z) => z.districts.includes(district))?.price;

export function buildCart(items: CartItem[], visit?: Visit | null) {
  const comboPc = items.some((i) => findService(i.serviceId)?.gpuCombo);
  const groups: { title: string; lines: Line[]; total: number; visit?: boolean }[] = items
    .map((item) => ({ title: item.title, ...buildQuote(item, comboPc) }))
    .filter((g) => g.lines.length > 0);
  const travel = visit ? travelFor(visit.district) : undefined;
  if (visit && groups.length > 0 && travel !== undefined && (visit.mode === "recojo" || homeVisitAllowed(items))) {
    const lines: Line[] =
      visit.mode === "domicilio"
        ? [{ label: "Visita a domicilio", price: homeVisit.fee }, { label: `Movilidad ${visit.district}`, price: travel }]
        : [{ label: `Movilidad ${visit.district}`, price: travel }];
    const title = `${visit.mode === "domicilio" ? "A domicilio" : "Recojo a domicilio"} · ${visit.district}`;
    groups.push({ title, lines, total: lines.reduce((sum, l) => sum + l.price, 0), visit: true });
  }
  return { groups, total: groups.reduce((sum, g) => sum + g.total, 0) };
}

export function whatsappUrl({ groups, total }: ReturnType<typeof buildCart>) {
  const text = [
    "Hola QuickFix, quiero agendar:",
    ...groups.flatMap((g) => ["", `*${g.title}*`, ...g.lines.map((l) => `• ${l.label}: ${formatSoles(l.price)}`)]),
    "",
    `Total referencial: ${formatSoles(total)}`,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
