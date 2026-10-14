import { diagnosis, maintenance } from "@/data/catalog";

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

export function buildCart(items: CartItem[]) {
  const groups = items.map((item) => ({ title: item.title, ...buildQuote(item) })).filter((g) => g.lines.length > 0);
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
