import { describe, expect, it } from "vitest";
import { fechaInforme, limpiarTexto, soles, total } from "@/lib/informe";

const cobros = [
  { concepto: "diagnóstico", monto: 0, nota: "Incluido en la reparación; precio regular S/. 99.00" },
  { concepto: "reparación", monto: 599.1, nota: "" },
  { concepto: "formateo", monto: 50.2, nota: "" },
];

describe("informe técnico", () => {
  it("suma los montos en la web, en céntimos exactos, y los muestra como en los informes", () => {
    expect(total(cobros)).toBe(649.3);
    expect(soles(1693)).toBe("S/. 1,693.00");
    expect(soles(0)).toBe("S/. 0.00");
  });

  it("escribe la fecha como en los informes", () => {
    expect(fechaInforme("2026-11-18T10:00:00-05:00")).toBe("Noviembre 18, 2026");
  });

  it("acomoda el borrador de la IA aunque venga incompleto o mal formado", () => {
    const t = limpiarTexto({
      conceptos: ["Servicio de Triage (Inspección óptica)"],
      estado: "reparado y operativo.",
      diagnostico: [{ titulo: "**Condensadores Defectuosos:**", texto: "Se midió…" }, { titulo: "", texto: "" }, "basura"],
      para_validar: ["¿Se hizo prueba de estrés?", 3],
    }, cobros, "NO REPARABLE");
    expect(t.conceptos).toEqual(["Servicio de Triage (Inspección óptica)", "reparación", "formateo"]);
    expect(t.estado).toBe("REPARADO Y OPERATIVO");
    expect(t.diagnostico).toEqual([{ titulo: "Condensadores Defectuosos", texto: "Se midió…" }]);
    expect(t.protocolo).toEqual([]);
    expect(t.para_validar).toEqual(["¿Se hizo prueba de estrés?"]);
    expect(limpiarTexto(null, cobros, "NO REPARABLE").estado).toBe("NO REPARABLE");
  });
});
