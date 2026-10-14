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
export type CartItem = Selection & { title: string };

/** Movilidad de un distrito, o undefined si no está en las zonas atendidas. */
export const travelFor = (district: string) => homeVisit.zones.find((z) => z.districts.includes(district))?.price;

/** `district`: atención a domicilio en ese distrito (visita + movilidad, una vez por pedido). */
export function buildCart(items: CartItem[], district?: string | null) {
  const groups: { title: string; lines: Line[]; total: number; visit?: boolean }[] = items
    .map((item) => ({ title: item.title, ...buildQuote(item) }))
    .filter((g) => g.lines.length > 0);
  const travel = district ? travelFor(district) : undefined;
  if (groups.length > 0 && travel !== undefined) {
    const lines: Line[] = [
      { label: "Visita a domicilio", price: homeVisit.fee },
      { label: `Movilidad ${district}`, price: travel },
    ];
    groups.push({ title: `A domicilio · ${district}`, lines, total: homeVisit.fee + travel, visit: true });
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
