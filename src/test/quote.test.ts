import { describe, it, expect } from "vitest";
import { buildCart, buildQuote, whatsappUrl } from "@/lib/quote";

describe("buildQuote", () => {
  it("aplica el 20% a la GPU solo en combo con PC gamer", () => {
    const q = buildQuote({ serviceId: "pc-gamer", extraIds: [], gpuId: "gpu-3fan" });
    expect(q.total).toBe(120 + 72);
  });

  it("no descuenta la GPU de gama alta", () => {
    expect(buildQuote({ serviceId: "pc-gamer-grande", extraIds: [], gpuId: "gpu-alta" }).total).toBe(220 + 135);
  });

  it("ignora la GPU si la PC no es gamer", () => {
    expect(buildQuote({ serviceId: "pc-oficina", extraIds: [], gpuId: "gpu-2fan" }).total).toBe(70);
  });

  it("GPU sola paga precio normal", () => {
    expect(buildQuote({ serviceId: "gpu-2fan", extraIds: [], gpuId: null }).total).toBe(60);
  });

  it("suma solo extras del servicio elegido", () => {
    const q = buildQuote({ serviceId: "laptop-gamer-pro", extraIds: ["pads", "metal-2", "no-existe"], gpuId: null });
    expect(q.total).toBe(150 + 120 + 150);
  });

  it("masilla térmica con precio fijo; laptop de oficina no tiene extras", () => {
    expect(buildQuote({ serviceId: "laptop-oficina-gpu", extraIds: ["pads"], gpuId: null }).total).toBe(85 + 45);
    expect(buildQuote({ serviceId: "laptop-gamer", extraIds: ["pads"], gpuId: null }).total).toBe(135 + 90);
    expect(buildQuote({ serviceId: "laptop-oficina", extraIds: ["pads"], gpuId: null }).total).toBe(70);
  });

  it("el carrito suma varios equipos y los lista en WhatsApp", () => {
    const cart = buildCart([
      { title: "ASUS ROG Strix G16 G614JV", serviceId: "laptop-gamer", extraIds: ["pads"], gpuId: null },
      { title: "PlayStation 5", serviceId: "ps5", extraIds: [], gpuId: null },
      { title: "vacío", serviceId: null, extraIds: [], gpuId: null },
    ]);
    expect(cart.groups).toHaveLength(2);
    expect(cart.total).toBe(135 + 90 + 140);
    const text = decodeURIComponent(whatsappUrl(cart));
    expect(text).toContain("*ASUS ROG Strix G16 G614JV*");
    expect(text).toContain("*PlayStation 5*");
    expect(text).toContain("Total referencial: S/ 365.00");
  });

  it("suma visita a domicilio y movilidad una sola vez por pedido", () => {
    const items = [
      { title: "PS5", serviceId: "ps5", extraIds: [], gpuId: null },
      { title: "PS4", serviceId: "ps4", extraIds: [], gpuId: null },
    ];
    expect(buildCart(items, "Surco").total).toBe(140 + 110 + 50 + 35);
    expect(buildCart(items, "San Miguel").total).toBe(140 + 110 + 50 + 15);
    expect(buildCart(items, null).total).toBe(140 + 110);
    expect(buildCart([], "Surco").total).toBe(0);
  });
});
