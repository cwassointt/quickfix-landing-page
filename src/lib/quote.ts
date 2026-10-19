import { diagnosis, homeVisit, maintenance } from "@/data/catalog";

export const WHATSAPP_NUMBER = "51940755119";

export type Selection = { serviceId: string | null; extraIds: string[]; gpuId: string | null };
export type Line = { label: string; price: number; muted?: boolean };

const services = [...maintenance.flatMap((c) => c.services), ...diagnosis];

export const findService = (id: string | null) => services.find((s) => s.id === id);

export function buildQuote({ serviceId, extraIds, gpuId }: Selection) {
  const service = findService(serviceId);
  const lines: Line[] = [];
  if (service) {
    lines.push({ label: service.name, price: service.price });
    for (const extra of service.extras ?? []) {
      if (extraIds.includes(extra.id)) lines.push({ label: `+ ${extra.name}`, price: extra.price });
    }
    const gpu = service.gpuCombo ? findService(gpuId) : undefined;
    if (gpu) {
      lines.push({ label: `+ GPU ${gpu.detail.split(" · ")[0]}`, price: gpu.price });
      if (gpu.comboPrice) lines.push({ label: "Dscto. combo PC + GPU", price: gpu.comboPrice - gpu.price, muted: true });
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
 * - recojo: recojo el componente y lo llevo al taller → solo movilidad (no aplica a PC de escritorio)
 */
export type Visit = { mode: "domicilio" | "recojo"; district: string };

/** Los diagnósticos se hacen en el taller: con uno en el pedido no hay atención a domicilio. */
export const homeVisitAllowed = (items: CartItem[]) => !items.some((i) => diagnosis.some((d) => d.id === i.serviceId));

/** El recojo no aplica a PC de escritorio: se trae al taller. */
export const pickupAllowed = (items: CartItem[]) => !items.some((i) => i.categoryId === "pcs" && i.serviceId);

/** Movilidad de un distrito, o undefined si no está en las zonas atendidas. */
export const travelFor = (district: string) => homeVisit.zones.find((z) => z.districts.includes(district))?.price;

export function buildCart(items: CartItem[], visit?: Visit | null) {
  const groups: { title: string; lines: Line[]; total: number; visit?: boolean }[] = items
    .map((item) => ({ title: item.title, ...buildQuote(item) }))
    .filter((g) => g.lines.length > 0);
  const travel = visit ? travelFor(visit.district) : undefined;
  if (visit && groups.length > 0 && travel !== undefined && (visit.mode === "domicilio" ? homeVisitAllowed(items) : pickupAllowed(items))) {
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
