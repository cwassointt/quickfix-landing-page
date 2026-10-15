import { describe, it, expect } from "vitest";
import laptops from "@/data/laptops.json";
import { maintenance } from "@/data/catalog";
import { laptopLabel, searchLaptops } from "@/lib/laptopSearch";

const top = (q: string) => {
  const r = searchLaptops(laptops, q)[0];
  return r && laptopLabel(r);
};

describe("searchLaptops", () => {
  it("reconoce el código completo de ASUS sin el sufijo", () => {
    expect(top("ASUS ROG STRIX G16 G614JV-AS73")).toBe("ASUS ROG Strix G16 G614JV");
    expect(top("g614jvas73")).toBe("ASUS ROG Strix G16 G614JV");
  });

  it("reconoce códigos de HP, Lenovo y Acer", () => {
    expect(top("HP OMEN 16-wf0010la")).toBe("HP Omen 16 16-wf");
    expect(top("omen 16-b0005la")).toBe("HP Omen 16 16-b");
    expect(top("Legion 5 Pro 16ACH6H")).toBe("Lenovo Legion 5 Pro 16ACH6H");
    expect(top("acer nitro an515-57")).toBe("Acer Nitro 5 AN515");
  });

  it("busca por nombre", () => {
    expect(searchLaptops(laptops, "victus").every((l) => l.name.startsWith("Victus"))).toBe(true);
    expect(top("alienware m16")).toMatch(/^Dell Alienware m16/);
  });

  it("no inventa resultados", () => {
    expect(searchLaptops(laptops, "zzzz")).toEqual([]);
    expect(searchLaptops(laptops, "a")).toEqual([]);
  });

  it("toda la línea ROG Strix es gama alta", () => {
    expect(laptops.filter((l) => l.name.startsWith("ROG Strix") && l.tier !== "laptop-gamer-pro")).toEqual([]);
  });

  it("cada modelo apunta a un servicio de laptop que existe", () => {
    const ids = new Set(maintenance.find((c) => c.id === "laptops")!.services.map((s) => s.id));
    expect(laptops.filter((l) => !ids.has(l.tier))).toEqual([]);
  });
});
