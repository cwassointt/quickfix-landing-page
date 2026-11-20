import { describe, expect, it } from "vitest";
import { FRASES, conBase, fechaInforme, garantiaInicial, limpiarTexto, soles, total, venceGarantia } from "@/lib/informe";

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
    expect(t.estado).toBe("NO REPARABLE");
    expect(limpiarTexto({ estado: "No reparable a nivel de componente." }, cobros, "REPARABLE").estado).toBe("REPARABLE");
    expect(limpiarTexto({ estado: "No reparable a nivel de componente." }, cobros, "").estado).toBe("NO REPARABLE");
    expect(t.diagnostico).toEqual([{ titulo: "Condensadores Defectuosos", texto: "Se midió…" }]);
    expect(t.protocolo).toEqual([]);
    expect(t.para_validar).toEqual(["¿Se hizo prueba de estrés?"]);
    expect(limpiarTexto(null, cobros, "NO REPARABLE").estado).toBe("NO REPARABLE");
  });
  it("el primer cobro depende del estado: diagnóstico 99 o reparación 299, y respeta el monto editado", () => {
    const diag = [{ concepto: "Diagnóstico electrónico", monto: 99, nota: "" }, { concepto: "formateo", monto: 50, nota: "" }];
    const rep = conBase(diag, "REPARABLE");
    expect(rep).toEqual([{ concepto: "Reparación electrónica", monto: 299, nota: "" }, diag[1]]);
    const editado = [{ ...rep[0], monto: 450 }, rep[1]];
    expect(conBase(editado, "REPARABLE")).toBe(editado);
    expect(conBase(editado, "NO REPARABLE")[0]).toEqual(diag[0]);
    const mantenimiento = [{ concepto: "Mantenimiento Paquete ROG", monto: 329, nota: "" }];
    expect(conBase(mantenimiento, "REPARABLE")).toBe(mantenimiento);
    expect(conBase(mantenimiento, "NO REPARABLE")).toBe(mantenimiento);
    expect(conBase([], "NO REPARABLE")).toEqual([diag[0]]);
  });
});

describe("garantía y frases", () => {
  it("calcula el vencimiento desde la fecha del informe", () => {
    expect(fechaInforme(venceGarantia("2026-11-20T10:00:00-05:00", "90 días")!.toISOString())).toBe("Febrero 18, 2027");
    expect(fechaInforme(venceGarantia("2026-11-20", "6 meses")!.toISOString())).toBe("Mayo 20, 2027");
    expect(venceGarantia("2026-11-20", "sin garantía")).toBeNull();
    expect(garantiaInicial("Mantenimiento")).toBe("6 meses");
    expect(garantiaInicial("Reparación")).toBe("90 días");
  });
  it("la frase del microprocesador marca no reparable", () => {
    expect(FRASES.find((f) => /microprocesador/i.test(f.nombre))?.resultado).toBe("NO REPARABLE");
  });
});
