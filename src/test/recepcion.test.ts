import { describe, expect, it } from "vitest";
import { avisoCliente, chatCliente, diaLima, equipo, preguntas, resumirFalla, validar, validarWhatsapp, type Registro } from "@/lib/recepcion";

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

  it("el asistente resume una falla de placa y la marca como reparación", () => {
    const r = resumirFalla({ enciende: ["No enciende para nada"], luz: ["No"], sintomas: ["Olor a quemado o chispazo"], antes: ["Le cayó líquido"], desde: ["Esta semana"], datos: ["Sí, hay que cuidarlos"] });
    expect(r.texto).toBe("No enciende para nada; al conectarlo no prende ninguna luz. Además: olor a quemado o chispazo. Antes de la falla: le cayó líquido. Pasa desde: esta semana. Tiene archivos importantes sin copia: cuidar los datos.");
    expect(r).toMatchObject({ servicio: "Reparación", liquido: true, abierto: false });
  });

  it("solo calor y ruido apunta a mantenimiento", () => {
    const r = resumirFalla({ enciende: ["Enciende normal"], sintomas: ["Se calienta mucho", "El ventilador suena fuerte"] });
    expect(r).toMatchObject({ servicio: "Mantenimiento", liquido: null, abierto: null });
  });

  it("la pregunta de la luz solo aparece si no enciende, y las de laptop solo en laptops", () => {
    expect(preguntas("Laptop").find((p) => p.id === "luz")!.si!({ enciende: ["Enciende normal"] })).toBe(false);
    expect(preguntas("Consola").find((p) => p.id === "sintomas")!.opciones).not.toContain("No carga la batería");
  });
});

describe("validación del formulario", () => {
  const ok: Registro = {
    nombre: "Ana Torres", dni: "", whatsapp: "987 654 321", correo: "", distrito: "", como: "", tipo: "Laptop", marca: "ASUS", modelo: "ROG Strix G15",
    serie: "", pin: "", accesorios: "", servicio: "", falla: "Se apaga al jugar", liquido: null, abierto: null, acepta: true, web: "",
    cuando: "Hoy", llega: diaLima(), modo: "taller", direccion: "", autoriza: 0, foto: "",
  };

  it("un registro completo no tiene errores", () => {
    expect(validar(ok)).toEqual({});
  });

  it("marca cada dato mal ingresado", () => {
    const e = validar({ ...ok, nombre: "Ana", whatsapp: "12345", dni: "123", correo: "ana@", serie: "ab", falla: "mal", acepta: false, tipo: "" });
    expect(Object.keys(e).sort()).toEqual(["acepta", "dni", "falla", "nombre", "serie", "tipo", "whatsapp", "correo"].sort());
  });

  it("acepta celulares con 51 y números extranjeros con +, y DNI o CE", () => {
    expect(validarWhatsapp("+51 987 654 321")).toBe(true);
    expect(validarWhatsapp("+34 612 345 678")).toBe(true);
    expect(validarWhatsapp("812345678")).toBe(false);
    expect(validar({ ...ok, dni: "70123456" }).dni).toBeUndefined();
    expect(validar({ ...ok, dni: "001234567" }).dni).toBeUndefined();
  });

  it("pide dirección si es recojo y una fecha válida si es otro día", () => {
    expect(validar({ ...ok, modo: "recojo", direccion: "" }).direccion).toBeDefined();
    expect(validar({ ...ok, cuando: "Otro día", llega: "" }).llega).toBeDefined();
    expect(validar({ ...ok, cuando: "Otro día", llega: diaLima(3) }).llega).toBeUndefined();
    expect(validar({ ...ok, cuando: "Otro día", llega: diaLima(90) }).llega).toBeDefined();
  });
});
