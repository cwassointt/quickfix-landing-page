import { describe, it, expect } from "vitest";
import sample from "@/data/componentes.sample.json";
import { armarPedido, instalacionesPara, mensajePedido, type Producto } from "@/lib/componentes";

const productos = new Map((sample.productos as Producto[]).map((p) => [p.sku, p]));
const taller = { modo: "taller" } as const;

describe("pedido de componentes", () => {
  it("elige la mano de obra por categoría, no por el nombre", () => {
    expect(instalacionesPara(productos.get("EJ-RAM-01")!).map((o) => o.precio)).toEqual([30]);
    expect(instalacionesPara(productos.get("EJ-SSD-01")!)).toHaveLength(3);
    // La laptop dice "16 GB" en el nombre pero no es memoria: solo configuración inicial.
    expect(instalacionesPara(productos.get("EJ-NB-01")!).map((o) => o.id)).toEqual(["config"]);
    expect(instalacionesPara(productos.get("EJ-MOU-01")!)).toEqual([]);
  });

  it("pide el mínimo de S/ 150 en productos, salvo con mantenimiento", () => {
    const solo = [{ sku: "EJ-PAD-01", cantidad: 1, instalacion: null }];
    expect(armarPedido(solo, productos, false, taller).falta).toBe(91);
    expect(armarPedido(solo, productos, true, taller).falta).toBe(0);
  });

  it("la instalación cuenta aparte del mínimo y baja de precio con mantenimiento", () => {
    const ram = [{ sku: "EJ-RAM-01", cantidad: 2, instalacion: "instalar" }];
    expect(armarPedido(ram, productos, false, taller).total).toBe(189 * 2 + 30 * 2);
    expect(armarPedido(ram, productos, true, taller).total).toBe(189 * 2);
  });

  it("suma la movilidad del distrito y marca los que no tienen tarifa", () => {
    const item = [{ sku: "EJ-PSU-01", cantidad: 1, instalacion: null }];
    expect(armarPedido(item, productos, false, { modo: "delivery", distrito: "Miraflores" }).total).toBe(479 + 25);
    expect(armarPedido(item, productos, false, { modo: "delivery", distrito: "Otro" }).movilidadACoordinar).toBe(true);
  });

  it("el mensaje lleva códigos y total", () => {
    const msg = mensajePedido([{ sku: "EJ-SSD-01", cantidad: 1, instalacion: "clonar" }], productos, false, taller);
    expect(msg).toContain("EJ-SSD-01 · SFYRD/1000G");
    expect(msg).toContain(`Total: S/ ${(389 + 70).toLocaleString("es-PE")}`);
  });
});
