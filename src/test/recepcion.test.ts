import { describe, expect, it } from "vitest";
import {
  aCsv, atrasado, avisoCliente, destinoEstado, faltaCotizar, mensajeSugerido, saldo, sinRecoger, diasEnEstado, progreso, chatCliente, diaLima, equipo, etiquetas, mensajesCliente, nombreContacto, preguntas, vcard, resumirFalla, sugerirCorreo, sugerirDistrito, validar, validarWhatsapp, type Registro,
} from "@/lib/recepcion";

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

describe("etiquetas", () => {
  const orden = {
    id: 7, numero: "QF-0007", creado: "2026-11-09T10:00:00-05:00", origen: "cliente", nombre: "Ana Torres", dni: "", whatsapp: "", correo: "", distrito: "",
    como: "", tipo: "Laptop", marca: "ASUS", modelo: "ROG Strix G16 G614JV", serie: "N3NRKD0099", pin: "", accesorios: "Cargador, Mouse", servicio: "Reparación",
    falla: "No enciende para nada; al conectarlo no prende ninguna luz. Además: olor a quemado.", liquido: 1, abierto: 0, estado: "recibido",
    recibido: null, recibido_por: null, llega: null, modo: "taller", direccion: "", autoriza: 0, foto: null,
  } as const;

  it("arma la etiqueta del equipo con aviso y la del cargador solo si lo dejó", () => {
    const [eq, cargador] = etiquetas(orden);
    expect(eq).toMatchObject({ PARTE: "EQUIPO", QF: "QF-0007", AVISO: "⚠ SE MOJÓ", FECHA: "09/11", FALLA: orden.falla, CLAVE: "sin clave" });
    expect(etiquetas({ ...orden, pin: " 1234 " })[0].CLAVE).toBe("1234");
    expect(etiquetas({ ...orden, pin: undefined as unknown as string })[0].CLAVE).toBe("—");
    const larga = "x ".repeat(500).trim();
    expect(etiquetas({ ...orden, falla: larga }).map((e) => e.PARTE)).toEqual(["EQUIPO", "CARGADOR"]);
    expect(etiquetas({ ...orden, falla: larga })[0].FALLA).toBe(larga);
    expect(eq.URL).toBe("https://quickfix.pe/taller/?qf=7");
    expect(etiquetas({ ...orden, whatsapp: "+51 987654321" })[0].WHATSAPP).toBe("987 654 321");
    expect(etiquetas({ ...orden, abierto: 1 })[0].AVISO).toBe("⚠ SE MOJÓ  ⚠ YA LO ABRIERON");
    expect(cargador.PARTE).toBe("CARGADOR");
    expect(etiquetas({ ...orden, accesorios: "" })).toHaveLength(1);
  });

  it("los mensajes de seguimiento llevan el N° y el presupuesto", () => {
    const m = mensajesCliente(orden, 250);
    expect(m.map((x) => x.id)).toEqual(["recibido", "presupuesto", "avance", "listo", "placa", "recordatorio", "entregado"]);
    expect(m[1].texto).toContain("QF-0007");
    expect(m[1].texto).toContain("S/ 250");
    expect(mensajesCliente(orden)[1].texto).toContain("S/ ___");
  });

  it("arma el nombre para agendar con N°, nombre, primer apellido y código del modelo", () => {
    expect(nombreContacto(orden)).toBe("QF-0007 Ana Torres · G614JV");
    expect(nombreContacto({ ...orden, nombre: "ana maría torres ruiz", modelo: "Zephyrus G14 GA402RJ" })).toBe("QF-0007 Ana Torres · GA402RJ");
    expect(nombreContacto({ ...orden, nombre: "Andy Hilario", tipo: "Consola", marca: "Sony", modelo: "PS5" })).toBe("QF-0007 Andy Hilario · PS5");
    const v = vcard({ ...orden, whatsapp: "987 654 321" });
    expect(v).toContain("FN:QF-0007 Ana Torres · G614JV");
    expect(v).toContain("TEL;TYPE=CELL:+51987654321");
  });

  it("el CSV escapa comas y comillas", () => {
    expect(aCsv([{ A: "x, y", B: 'dijo "hola"' }])).toBe('A,B\r\n"x, y","dijo ""hola"""\r\n');
  });
});

describe("autocompletar", () => {
  it("sugiere distritos sin importar tildes ni mayúsculas", () => {
    expect(sugerirDistrito("san mi")).toEqual(["San Miguel"]);
    expect(sugerirDistrito("rimac")).toEqual(["Rímac"]);
    expect(sugerirDistrito("surco")).toEqual(["Santiago de Surco"]);
    expect(sugerirDistrito("San Miguel")).toEqual([]);
  });

  it("completa el dominio del correo", () => {
    expect(sugerirCorreo("ana")[0]).toBe("ana@gmail.com");
    expect(sugerirCorreo("ana@ho")).toEqual(["ana@hotmail.com"]);
    expect(sugerirCorreo("ana@gmail.com")).toEqual([]);
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

describe("tablero", () => {
  const dia = 86_400_000;
  const ahora = Date.parse("2026-11-20T12:00:00-05:00");
  const caso = (estado: string, cambioHaceDias: number | null, recibidoHaceDias = 10) => ({
    estado, creado: new Date(ahora - 20 * dia).toISOString(),
    recibido: new Date(ahora - recibidoHaceDias * dia).toISOString(),
    cambio: cambioHaceDias === null ? null : new Date(ahora - cambioHaceDias * dia).toISOString(),
  });

  it("cuenta los días desde el cambio de estado; sin cambio guardado, desde que se recibió", () => {
    expect(diasEnEstado(caso("diagnostico", 3), ahora)).toBe(3);
    expect(diasEnEstado(caso("diagnostico", null, 6), ahora)).toBe(6);
    expect(diasEnEstado({ cambio: "basura", recibido: null, creado: "" }, ahora)).toBe(0);
  });

  it("marca atrasado solo pasado el plazo de cada estado", () => {
    expect(atrasado(caso("diagnostico", 4), ahora)).toBe(false);
    expect(atrasado(caso("diagnostico", 5), ahora)).toBe(true);
    expect(atrasado(caso("pruebas", 5), ahora)).toBe(true); // estado antiguo = diagnóstico
    expect(atrasado(caso("entregado", 90), ahora)).toBe(false);
    expect(atrasado(caso("registrado", 30), ahora)).toBe(false);
  });

  it("la barra de progreso sabe si terminó sin reparar", () => {
    expect(progreso("devuelto")).toEqual({ etapa: 4, mal: true });
    expect(progreso("listo")).toEqual({ etapa: 3, mal: false });
    expect(progreso("registrado")).toEqual({ etapa: 0, mal: false });
  });
});

describe("estados", () => {
  it("Entregado depende del resultado y exige cotizar la placa si no se reparó", () => {
    expect(destinoEstado("reparado", "entregado", false)).toEqual({ estado: "entregado" });
    expect(destinoEstado("listo", "entregado", false)).toEqual({ estado: "entregado" });
    expect(destinoEstado("no_reparado", "entregado", true)).toEqual({ estado: "devuelto" });
    expect(destinoEstado("no_reparado", "entregado", false)).toHaveProperty("error");
    expect(destinoEstado("diagnostico", "entregado", true)).toHaveProperty("error");
    expect(destinoEstado("entregado", "diagnostico", false)).toEqual({ estado: "diagnostico" });
  });

  it("marca los no reparados sin cotización de placa", () => {
    expect(faltaCotizar({ estado: "no_reparado", cotizada: 0 })).toBe(true);
    expect(faltaCotizar({ estado: "no_reparado", cotizada: 1 })).toBe(false);
    expect(faltaCotizar({ estado: "devuelto", cotizada: 0 })).toBe(false);
  });

  it("el mensaje lleva el enlace de seguimiento y el monto de la placa", () => {
    const m = mensajesCliente({ nombre: "Ana Torres", numero: "QF-0007", tipo: "Laptop", marca: "ASUS", modelo: "G614JV", seguir: "a".repeat(24) }, null, 850);
    expect(m.find((x) => x.id === "recibido")!.texto).toContain("https://quickfix.pe/seguimiento/?t=" + "a".repeat(24));
    expect(m.find((x) => x.id === "placa")!.texto).toContain("S/ 850");
  });
});

describe("recordatorio y pagos", () => {
  const dia = 86_400_000;
  const base = { creado: "2026-01-01T10:00:00Z", recibido: null, cambio: "2026-01-01T10:00:00Z" };
  const t0 = Date.parse(base.cambio);
  it("pide recordar al cliente desde los 7 días listo o sin reparar", () => {
    expect(sinRecoger({ ...base, estado: "reparado" }, t0 + 6 * dia)).toBe(false);
    expect(sinRecoger({ ...base, estado: "reparado" }, t0 + 7 * dia)).toBe(true);
    expect(sinRecoger({ ...base, estado: "no_reparado" }, t0 + 9 * dia)).toBe(true);
    expect(sinRecoger({ ...base, estado: "entregado" }, t0 + 30 * dia)).toBe(false);
    expect(mensajeSugerido({ ...base, estado: "reparado" }, t0 + 8 * dia)).toBe("recordatorio");
    expect(mensajeSugerido({ ...base, estado: "reparado" }, t0 + dia)).toBe("listo");
  });
  it("el saldo es presupuesto menos lo pagado, sin bajar de cero", () => {
    expect(saldo(300, 100)).toBe(200);
    expect(saldo(0.3, 0.1)).toBe(0.2);
    expect(saldo(100, 150)).toBe(0);
    expect(saldo(null, 0)).toBe(0);
  });
});
