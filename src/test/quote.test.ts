import { describe, it, expect } from "vitest";
import { buildCart, buildQuote, gpuExtra, homeVisitAllowed, whatsappUrl } from "@/lib/quote";

describe("buildQuote", () => {
  it("aplica el 10% a la GPU en combo con PC gamer, también en gama alta", () => {
    expect(buildQuote({ serviceId: "pc-gamer", extraIds: [], gpuId: "gpu-3fan" }).total).toBe(120 + 81);
    expect(buildQuote({ serviceId: "pc-gamer-grande", extraIds: [], gpuId: "gpu-alta" }).total).toBeCloseTo(220 + 121.5);
  });

  it("en el combo se pueden sumar los extras de la GPU sin chocar con los de la PC", () => {
    const q = buildQuote({ serviceId: "pc-gamer", extraIds: ["pads", gpuExtra("pads")], gpuId: "gpu-3fan" });
    expect(q.total).toBe(120 + 65 + 81 + 55); // pads VRM de la PC + pads VRAM de la GPU
  });

  it("la GPU agregada como otro equipo junto a una PC gamer también lleva el descuento", () => {
    const pc = { title: "PC", serviceId: "pc-gamer", extraIds: [], gpuId: null };
    const gpu = { title: "GPU", serviceId: "gpu-2fan", extraIds: [], gpuId: null };
    expect(buildCart([pc, gpu]).total).toBe(120 + 54);
    expect(buildCart([gpu]).total).toBe(60);
  });

  it("formateo de S/ 50 como extra en laptops y PC", () => {
    expect(buildQuote({ serviceId: "laptop-oficina", extraIds: ["formateo"], gpuId: null }).total).toBe(70 + 50);
    expect(buildQuote({ serviceId: "pc-gamer", extraIds: ["formateo"], gpuId: null }).total).toBe(120 + 50);
    expect(buildQuote({ serviceId: "ps5", extraIds: ["formateo"], gpuId: null }).total).toBe(140);
  });

  it("ignora la GPU si la PC no es gamer", () => {
    expect(buildQuote({ serviceId: "pc-oficina", extraIds: [], gpuId: "gpu-2fan" }).total).toBe(70);
  });

  it("GPU sola paga precio normal", () => {
    expect(buildQuote({ serviceId: "gpu-2fan", extraIds: [], gpuId: null }).total).toBe(60);
  });

  it("suma solo extras del servicio elegido", () => {
    const q = buildQuote({ serviceId: "laptop-gamer-pro", extraIds: ["pads", "metal", "no-existe"], gpuId: null });
    expect(q.total).toBe(150 + 99 + 80);
  });

  it("masilla térmica con precio fijo; laptop de oficina no tiene masilla", () => {
    expect(buildQuote({ serviceId: "laptop-gamer", extraIds: ["pads"], gpuId: null }).total).toBe(120 + 79);
    expect(buildQuote({ serviceId: "laptop-oficina", extraIds: ["pads"], gpuId: null }).total).toBe(70);
  });

  it("el carrito suma varios equipos y los lista en WhatsApp", () => {
    const cart = buildCart([
      { title: "ASUS ROG Strix G16 G614JV", serviceId: "laptop-gamer", extraIds: ["pads"], gpuId: null },
      { title: "PlayStation 5", serviceId: "ps5", extraIds: [], gpuId: null },
      { title: "vacío", serviceId: null, extraIds: [], gpuId: null },
    ]);
    expect(cart.groups).toHaveLength(2);
    expect(cart.total).toBe(120 + 79 + 140);
    const text = decodeURIComponent(whatsappUrl(cart));
    expect(text).toContain("*ASUS ROG Strix G16 G614JV*");
    expect(text).toContain("*PlayStation 5*");
    expect(text).toContain("Total referencial: S/ 339.00");
  });

  it("suma visita a domicilio y movilidad una sola vez por pedido", () => {
    const items = [
      { title: "PS5", serviceId: "ps5", extraIds: [], gpuId: null },
      { title: "PS4", serviceId: "ps4", extraIds: [], gpuId: null },
    ];
    expect(buildCart(items, { mode: "domicilio", district: "Surco" }).total).toBe(140 + 110 + 50 + 35);
    expect(buildCart(items, { mode: "domicilio", district: "San Miguel" }).total).toBe(140 + 110 + 50 + 15);
    expect(buildCart(items, null).total).toBe(140 + 110);
    expect(buildCart([], { mode: "domicilio", district: "Surco" }).total).toBe(0);
  });

  it("con un diagnóstico no se cobra visita a domicilio", () => {
    const diag = { title: "Diagnóstico", serviceId: "diag-electronico", extraIds: [], gpuId: null };
    expect(buildCart([diag], { mode: "domicilio", district: "Surco" }).total).toBe(99);
    expect(buildCart([diag], { mode: "recojo", district: "Surco" }).total).toBe(99 + 35);
  });

  it("masilla o pads en VRAM según la tarjeta gráfica", () => {
    expect(buildCart([{ title: "GPU", serviceId: "gpu-2fan", extraIds: ["pads"], gpuId: null }]).total).toBe(60 + 35);
    expect(buildCart([{ title: "GPU", serviceId: "gpu-3fan", extraIds: ["pads"], gpuId: null }]).total).toBe(90 + 55);
    expect(buildCart([{ title: "GPU", serviceId: "gpu-alta", extraIds: ["pads"], gpuId: null }]).total).toBe(135 + 75);
  });

  it("PC gamer: solo en el taller, pero se puede recoger", () => {
    const pc = { title: "PC", serviceId: "pc-gamer", extraIds: [], gpuId: null, categoryId: "pcs" };
    const oficina = { title: "PC", serviceId: "pc-oficina", extraIds: [], gpuId: null, categoryId: "pcs" };
    expect(homeVisitAllowed([pc])).toBe(false);
    expect(homeVisitAllowed([oficina])).toBe(true);
    expect(buildCart([pc], { mode: "domicilio", district: "Breña" }).total).toBe(120);
    expect(buildCart([pc], { mode: "recojo", district: "Breña" }).total).toBe(120 + 25);
  });
});
