// Informe técnico de diagnóstico y reparación: datos, montos y limpieza del borrador que redacta la IA.

export type Fila = { titulo: string; texto: string };
export type Cobro = { concepto: string; monto: number; nota: string };
export type Notas = { hallazgos: string; trabajo: string; resultado: string; contexto: string };
export type Texto = {
  conceptos: string[]; antecedentes: string; intro: string; diagnostico: Fila[]; protocolo: Fila[];
  estado: string; cierre: Fila[]; observaciones: Fila[]; para_validar: string[];
};
export type Informe = { notas: Notas; cobros: Cobro[]; adelanto: number | null; texto: Texto | null; fecha: string };

export const RESULTADOS = ["REPARABLE", "NO REPARABLE"];

/** Cualquier variante que escriba la IA ("Reparado y operativo", "No reparable a nivel de componente.") → uno de los dos. */
const resultadoDe = (v: string) => (/^NO\s/.test(v) ? "NO REPARABLE" : /^REPAR/.test(v) ? "REPARABLE" : "");

/** El primer cobro siempre es el del estado: diagnóstico (S/. 99) si no es reparable, reparación (S/. 299 por defecto, editable) si lo es. */
export const cobroBase = (resultado: string): Cobro =>
  resultado === "REPARABLE" ? { concepto: "Reparación electrónica", monto: 299, nota: "" } : { concepto: "Diagnóstico electrónico", monto: 99, nota: "" };

/**
 * Pone el cobro del estado como primera fila cuando está vacía o tiene el del otro estado.
 * Si el técnico la cambió (por ejemplo, un mantenimiento: "Paquete ROG"), la respeta.
 */
export function conBase(cobros: Cobro[], resultado: string): Cobro[] {
  const otro = cobroBase(resultado === "REPARABLE" ? "NO REPARABLE" : "REPARABLE").concepto;
  const primera = cobros[0]?.concepto.trim() ?? "";
  return primera === "" || primera === otro ? [cobroBase(resultado), ...cobros.slice(1)] : cobros;
}

export const informeNuevo = (): Informe => ({
  notas: { hallazgos: "", trabajo: "", resultado: RESULTADOS[0], contexto: "" },
  cobros: [cobroBase(RESULTADOS[0])],
  adelanto: null, texto: null, fecha: "",
});

/** 1693 → "S/. 1,693.00" (el formato de los informes del laboratorio). */
export const soles = (n: number) => `S/. ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** La web suma los montos: nunca se confía en la suma de la IA. Redondea a céntimos para evitar 0.1 + 0.2. */
export const total = (cobros: Cobro[]) => Math.round(cobros.reduce((s, c) => s + (Number.isFinite(c.monto) ? c.monto : 0), 0) * 100) / 100;

/** "2026-11-18" → "Noviembre 18, 2026". */
export function fechaInforme(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  const mes = d.toLocaleDateString("es-PE", { month: "long" });
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${d.getDate()}, ${d.getFullYear()}`;
}

const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const filas = (v: unknown): Fila[] =>
  (Array.isArray(v) ? v : [])
    .map((f) => ({ titulo: texto(f?.titulo).replace(/[*:]+$/g, "").replace(/^\*+/, "").trim(), texto: texto(f?.texto) }))
    .filter((f) => f.titulo || f.texto);

/**
 * Deja el borrador de la IA con la forma exacta que espera la página, aunque falten campos o vengan mal.
 * Los conceptos siempre quedan uno por cobro: si la IA se salta uno, se usa el que escribió el técnico.
 */
export function limpiarTexto(v: unknown, cobros: Cobro[], resultado: string): Texto {
  const r = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const conceptos = Array.isArray(r.conceptos) ? r.conceptos : [];
  const estado = texto(r.estado).replace(/\.$/, "").toUpperCase();
  return {
    conceptos: cobros.map((c, i) => texto(conceptos[i]) || c.concepto),
    antecedentes: texto(r.antecedentes),
    intro: texto(r.intro),
    diagnostico: filas(r.diagnostico),
    protocolo: filas(r.protocolo),
    // Manda el resultado que eligió el técnico (de él depende el primer cobro); lo de la IA solo si no hay.
    estado: resultadoDe(resultado.toUpperCase()) || resultadoDe(estado) || RESULTADOS[0],
    cierre: filas(r.cierre),
    observaciones: filas(r.observaciones),
    para_validar: (Array.isArray(r.para_validar) ? r.para_validar : []).map(texto).filter(Boolean),
  };
}
