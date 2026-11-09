import { describe, expect, it } from "vitest";
import { avisoCliente, chatCliente, equipo } from "@/lib/recepcion";

describe("recepción", () => {
  it("arma el chat con números peruanos o con código de país", () => {
    expect(chatCliente("987 654 321", "hola")).toBe("https://wa.me/51987654321?text=hola");
    expect(chatCliente("+51 987-654-321", "hola")).toBe("https://wa.me/51987654321?text=hola");
  });

  it("el aviso del cliente lleva su número de orden y su equipo", () => {
    const link = decodeURIComponent(avisoCliente("QF-0007", { nombre: "Ana", tipo: "Laptop", marca: "ASUS", modelo: "ROG Strix G15", falla: "Se apaga" }));
    expect(link).toContain("QF-0007");
    expect(link).toContain("laptop ASUS ROG Strix G15");
    expect(equipo({ tipo: "Consola", marca: "", modelo: "" })).toBe("Consola");
  });
});
