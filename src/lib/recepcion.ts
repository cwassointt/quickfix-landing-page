import { waLink } from "@/lib/site";

/** Lo que el cliente llena en /recepcion/. Los nombres coinciden con CAMPOS en public/api/recepcion.php. */
export type Registro = {
  nombre: string; dni: string; whatsapp: string; correo: string; distrito: string; como: string;
  tipo: string; marca: string; modelo: string; serie: string; pin: string; accesorios: string;
  servicio: string; falla: string; liquido: boolean | null; abierto: boolean | null; acepta: boolean;
  /** Cuándo llega el equipo: opción elegida y la fecha (AAAA-MM-DD) que se guarda. */
  cuando: string; llega: string;
  modo: "taller" | "recojo"; direccion: string;
  /** Monto hasta el que se puede reparar sin consultar (0 = consultar siempre). */
  autoriza: number;
  /** Foto de la etiqueta como data URL JPEG, ya reducida en el navegador. */
  foto: string;
  /** Campo trampa: oculto para personas, los robots lo llenan. */
  web: string;
};

export type Orden = Omit<Registro, "acepta" | "web" | "liquido" | "abierto" | "cuando" | "foto" | "llega" | "autoriza"> & {
  id: number; numero: string; creado: string; origen: "cliente" | "taller";
  liquido: 0 | 1 | null; abierto: 0 | 1 | null; llega: string | null; autoriza: number | null; foto: 0 | 1 | null;
  /** Solo llega con sesión de admin. */
  presupuesto?: number | null;
  estado: string; recibido: string | null; recibido_por: string | null;
};
export type Rol = "admin" | "mostrador";

export const OPCIONES = {
  tipo: ["Laptop", "PC", "Tarjeta gráfica", "Consola", "Otro"],
  como: ["Google", "TikTok", "IA (ChatGPT, Gemini, Claude…)", "Recomendación", "Ya soy cliente", "Otro"],
  servicio: ["Mantenimiento", "Reparación"],
  accesorios: ["Cargador", "Funda o mochila", "Mouse", "Control", "Cables"],
  cuando: ["Ya estoy en el taller", "Hoy", "Mañana", "Otro día"],
  autoriza: [["Consúltame siempre", 0], ["Hasta S/ 150", 150], ["Hasta S/ 300", 300], ["Hasta S/ 500", 500]] as [string, number][],
};

/** Fecha de hoy en Lima (AAAA-MM-DD), más `dias`. */
export function diaLima(dias = 0) {
  const d = new Date(Date.now() + dias * 86_400_000);
  return d.toLocaleDateString("en-CA", { timeZone: "America/Lima" });
}

// ---------- Autocompletar: distritos de Lima y Callao, dominios de correo ----------

export const DISTRITOS_LIMA = [
  "Ancón", "Ate", "Barranco", "Bellavista", "Breña", "Callao", "Carabayllo", "Carmen de la Legua Reynoso", "Chaclacayo", "Chorrillos",
  "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María", "La Molina", "La Perla", "La Punta", "La Victoria", "Lima",
  "Lince", "Los Olivos", "Lurigancho", "Lurín", "Magdalena del Mar", "Mi Perú", "Miraflores", "Pachacámac", "Pucusana", "Pueblo Libre",
  "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac", "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho",
  "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel", "Santa Anita", "Santa María del Mar", "Santa Rosa",
  "Santiago de Surco", "Surquillo", "Ventanilla", "Villa El Salvador", "Villa María del Triunfo",
];
const DOMINIOS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "live.com"];

/** Sin tildes ni mayúsculas, para comparar lo que escribe el cliente. */
const plano = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Distritos que empiezan con lo escrito (o lo contienen en alguna palabra); vacío si ya está escrito tal cual. */
export function sugerirDistrito(v: string, max = 5) {
  const q = plano(v);
  if (q.length < 2 || DISTRITOS_LIMA.includes(v.trim())) return [];
  const empieza = DISTRITOS_LIMA.filter((d) => plano(d).startsWith(q));
  const palabra = DISTRITOS_LIMA.filter((d) => !empieza.includes(d) && plano(d).split(" ").some((w) => w.startsWith(q)));
  return [...empieza, ...palabra].slice(0, max);
}

/** "ana" o "ana@g" → ana@gmail.com, ana@hotmail.com…; vacío si el correo ya está completo. */
export function sugerirCorreo(v: string) {
  const [usuario, dominio = ""] = v.trim().split("@");
  if (!usuario || v.includes(" ") || DOMINIOS.includes(dominio.toLowerCase())) return [];
  return DOMINIOS.filter((d) => d.startsWith(dominio.toLowerCase())).map((d) => `${usuario}@${d}`);
}

// ---------- Validación: mismas reglas que public/api/recepcion.php ----------

export type Campo = "nombre" | "whatsapp" | "dni" | "correo" | "distrito" | "tipo" | "marca" | "modelo" | "serie" | "llega" | "direccion" | "falla" | "acepta";
export type Errores = Partial<Record<Campo, string>>;
/** Campos de cada ficha del carrusel. */
export const FICHAS: Campo[][] = [
  ["nombre", "whatsapp", "dni", "correo", "distrito"],
  ["tipo", "marca", "modelo", "serie"],
  ["llega", "direccion", "falla", "acepta"],
];

const LETRAS = /^[\p{L}' .-]+$/u;

export function validarWhatsapp(v: string) {
  const d = v.replace(/\D/g, "");
  const extranjero = v.trim().startsWith("+") && !d.startsWith("51") && d.length >= 8 && d.length <= 15;
  return /^(51)?9\d{8}$/.test(d) || extranjero;
}

export function validar(r: Registro): Errores {
  const e: Errores = {};
  const t = (v: string) => v.trim();
  if (!t(r.nombre)) e.nombre = "Escribe tu nombre.";
  else if (!LETRAS.test(t(r.nombre))) e.nombre = "Usa solo letras.";
  else if (t(r.nombre).split(/\s+/).length < 2) e.nombre = "Escribe tu nombre y apellido.";
  if (!t(r.whatsapp)) e.whatsapp = "Escribe tu WhatsApp.";
  else if (!validarWhatsapp(r.whatsapp)) e.whatsapp = "Debe tener 9 dígitos y empezar con 9. Si es extranjero, empieza con +.";
  if (t(r.dni) && !/^(\d{8}|[A-Za-z0-9]{9,12})$/.test(t(r.dni))) e.dni = "El DNI tiene 8 dígitos; el CE, de 9 a 12 caracteres.";
  if (t(r.correo) && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(t(r.correo))) e.correo = "Revisa tu correo, por ejemplo nombre@gmail.com.";
  if (t(r.distrito) && (!LETRAS.test(t(r.distrito)) || t(r.distrito).length < 3)) e.distrito = "Escribe un distrito válido.";
  if (!r.tipo) e.tipo = "Elige el tipo de equipo.";
  if (t(r.marca).length < 2) e.marca = "Escribe la marca.";
  if (t(r.modelo).length < 2) e.modelo = "Escribe el modelo.";
  if (t(r.serie) && !/^[A-Za-z0-9-]{5,30}$/.test(t(r.serie))) e.serie = "Solo letras y números, sin espacios (5 a 30).";
  if (!r.cuando) e.llega = "Elige cuándo traes el equipo.";
  else if (r.cuando === "Otro día" && (!r.llega || r.llega < diaLima() || r.llega > diaLima(60))) e.llega = "Elige una fecha desde hoy y dentro de 60 días.";
  if (r.modo === "recojo" && t(r.direccion).length < 8) e.direccion = "Escribe la dirección completa para recogerlo.";
  if (t(r.falla).length < 10) e.falla = "Cuéntame un poco más (mínimo 10 letras), o usa «No sé, ayúdame».";
  if (!r.acepta) e.acepta = "Debes aceptar las condiciones para registrar.";
  return e;
}

export const ESTADOS: Record<string, string> = {
  registrado: "Por recibir", recibido: "Recibido", diagnostico: "En diagnóstico", aprobacion: "Esperando aprobación",
  reparacion: "En reparación", pruebas: "En pruebas", listo: "Listo para recoger", entregado: "Entregado", devuelto: "Devuelto sin reparar",
};

export const API = "/api/recepcion.php";

export async function api<T>(accion: string, body?: unknown, query = ""): Promise<T> {
  const res = await fetch(`${API}?accion=${accion}${query}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({ error: "No hay conexión con el servidor." }));
  if (!res.ok || data.error) throw Object.assign(new Error(data.error ?? "Error"), { status: res.status });
  return data as T;
}

export const equipo = (o: Pick<Registro, "tipo" | "marca" | "modelo">) => [o.marca, o.modelo].filter(Boolean).join(" ") || o.tipo;

// ---------- Etiquetas (navegador y OpenLabel+) ----------

/** Resumen de la falla para 2 líneas de la etiqueta: suma frases mientras quepan y corta en palabra completa. */
export function fallaCorta(falla: string, max = 64) {
  const partes = falla.replace(/\s+/g, " ").trim().split(/(?<=[.;!?])\s/);
  let texto = partes[0];
  for (const p of partes.slice(1)) {
    if (texto.length + 1 + p.length > max) break;
    texto += ` ${p}`;
  }
  texto = texto.replace(/[.;]$/, "");
  if (texto.length <= max) return texto;
  const corte = texto.lastIndexOf(" ", max - 1);
  return texto.slice(0, corte > 20 ? corte : max - 1) + "…";
}

export type Etiqueta = {
  PARTE: string; QF: string; FECHA: string; SERVICIO: string; AVISO: string; CLIENTE: string; WHATSAPP: string; EQUIPO: string; SN: string; FALLA: string; URL: string;
};

/** Página del caso que abre el QR (pide la clave del taller si no hay sesión). */
export const urlCaso = (id: number) => `https://quickfix.pe/taller/?qf=${id}`;

/** 987654321 → "987 654 321"; otros formatos se dejan como los escribió el cliente. */
export const telefono = (v: string) => {
  const d = v.replace(/\D/g, "").replace(/^51(?=9\d{8}$)/, "");
  return /^9\d{8}$/.test(d) ? d.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3") : v.trim();
};

/** Datos de cada etiqueta: la del equipo y, si dejó cargador, la del cargador. Las claves son las columnas del CSV. */
export function etiquetas(o: Orden): Etiqueta[] {
  const base = {
    QF: o.numero,
    // en-GB da siempre dd/mm con dos dígitos (es-PE a veces quita el cero).
    FECHA: new Date(o.recibido ?? o.creado).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", timeZone: "America/Lima" }),
    SERVICIO: (o.servicio || "Revisión").toUpperCase(),
    // Riesgos que declaró el cliente, en palabras simples: equipos delicados de manipular.
    AVISO: [o.liquido === 1 && "⚠ SE MOJÓ", o.abierto === 1 && "⚠ YA LO ABRIERON"].filter(Boolean).join("  "),
    CLIENTE: o.nombre,
    WHATSAPP: o.whatsapp ? `WhatsApp ${telefono(o.whatsapp)}` : "",
    EQUIPO: equipo(o),
    SN: `S/N ${o.serie || "—"}`,
    URL: urlCaso(o.id),
  };
  const lista: Etiqueta[] = [{ PARTE: "EQUIPO", ...base, FALLA: fallaCorta(o.falla) }];
  if (/cargador/i.test(o.accesorios ?? "")) lista.push({ PARTE: "CARGADOR", ...base, FALLA: `Cargador de ${equipo(o)}` });
  return lista;
}

type DatosMensaje = Pick<Orden, "nombre" | "numero" | "tipo" | "marca" | "modelo">;
export const saludo = (o: DatosMensaje) => `Hola ${o.nombre.split(" ")[0]}, te escribo de QuickFix por tu ${equipo(o)} (${o.numero}).`;

/** Mensajes de seguimiento ya redactados para el WhatsApp del cliente, según el momento del caso. */
export function mensajesCliente(o: DatosMensaje, presupuesto?: number | null) {
  const hola = saludo(o);
  return [
    { id: "recibido", titulo: "Recibido", texto: `${hola} Ya lo recibí y empiezo con la revisión. Te aviso apenas tenga el diagnóstico.` },
    { id: "presupuesto", titulo: "Presupuesto", texto: `${hola} Ya tengo el diagnóstico. La reparación cuesta S/ ${presupuesto ?? "___"}. ¿Te parece si avanzo?` },
    { id: "avance", titulo: "Avance", texto: `${hola} Te cuento cómo va: ` },
    { id: "listo", titulo: "Listo", texto: `${hola} ¡Ya está listo para recoger! Talambo 135, San Miguel. Avísame a qué hora vienes.` },
  ];
}

/** CSV con encabezados (sin BOM: OpenLabel+ lee UTF-8). Comillas solo donde hace falta. */
export function aCsv(filas: Record<string, string>[]) {
  if (!filas.length) return "";
  const celda = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const cols = Object.keys(filas[0]);
  return [cols, ...filas.map((f) => cols.map((c) => f[c] ?? ""))].map((r) => r.map(celda).join(",")).join("\r\n") + "\r\n";
}

/** Mensaje que el cliente te manda al terminar: así tienes su contacto en WhatsApp sí o sí. */
export const avisoCliente = (numero: string, r: Pick<Registro, "nombre" | "tipo" | "marca" | "modelo" | "falla"> & Partial<Pick<Registro, "modo" | "direccion">>) =>
  waLink(`Hola QuickFix, soy ${r.nombre}. Registré mi ${r.tipo.toLowerCase()} ${equipo(r)} con el N° ${numero}.\nFalla: ${r.falla}${r.modo === "recojo" ? `\nQuiero que lo recojan en: ${r.direccion}` : ""}`);

/** Chat con el cliente (números peruanos de 9 dígitos o con código de país). */
export function chatCliente(whatsapp: string, texto: string) {
  const d = whatsapp.replace(/\D/g, "");
  const num = d.length === 9 ? `51${d}` : d;
  return `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
}

export const fecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";

// ---------- Asistente "No sé": preguntas de reparación y resumen para el campo de la falla ----------

export type Pregunta = { id: string; titulo: string; opciones: string[]; multi?: boolean; si?: (r: Respuestas) => boolean };
export type Respuestas = Record<string, string[]>;

const NO_ENCIENDE = "No enciende para nada";
const SOLO_LAPTOP = ["No carga la batería", "Líneas, manchas o pantalla negra", "El teclado o touchpad no responde"];

/** Preguntas según el tipo de equipo. `si` muestra una pregunta solo cuando aplica. */
export function preguntas(tipo: string): Pregunta[] {
  const laptop = tipo === "Laptop";
  const corriente = laptop ? "conectar el cargador" : "conectarlo a la corriente";
  return [
    { id: "enciende", titulo: "¿Tu equipo enciende?", opciones: ["Enciende normal", "Enciende pero no da imagen", NO_ENCIENDE, "Se apaga solo", "Enciende a veces"] },
    { id: "luz", titulo: `Al ${corriente}, ¿se prende alguna luz?`, opciones: ["Sí", "No", "No me fijé"], si: (r) => r.enciende?.[0] === NO_ENCIENDE },
    {
      id: "sintomas", titulo: "¿Qué más notas?", multi: true,
      opciones: [
        "Se calienta mucho", "El ventilador suena fuerte", ...(laptop ? SOLO_LAPTOP : []),
        ...(tipo === "Consola" ? [] : ["Se reinicia o sale pantallazo azul"]), "Va muy lento", "No hay sonido",
        "Algún puerto no funciona (USB, HDMI, carga)", "Olor a quemado o chispazo",
      ],
    },
    { id: "antes", titulo: "¿Pasó algo antes de la falla?", multi: true, opciones: ["Le cayó líquido", "Se golpeó o se cayó", "Lo abrió otro técnico", "Una actualización o formateo", "Nada, fue de repente", "Fue empeorando poco a poco"] },
    { id: "desde", titulo: "¿Desde cuándo pasa?", opciones: ["Hoy o ayer", "Esta semana", "Este mes", "Hace más de un mes"] },
    { id: "datos", titulo: "¿Tiene archivos importantes sin copia?", opciones: ["Sí, hay que cuidarlos", "No, tengo copia o no importan"] },
  ];
}

const REPARACION = ["Enciende pero no da imagen", NO_ENCIENDE, "Se apaga solo", "Enciende a veces", ...SOLO_LAPTOP, "Se reinicia o sale pantallazo azul",
  "No hay sonido", "Algún puerto no funciona (USB, HDMI, carga)", "Olor a quemado o chispazo", "Le cayó líquido", "Se golpeó o se cayó"];
const min = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Convierte las respuestas en un resumen breve y deduce servicio, si se mojó y si otro técnico lo abrió. */
export function resumirFalla(r: Respuestas) {
  const enciende = r.enciende?.[0];
  const sintomas = r.sintomas ?? [];
  const antes = r.antes ?? [];
  const frases: string[] = [];
  if (enciende) {
    let f = enciende;
    if (r.luz?.[0] === "Sí") f += "; al conectarlo sí prende una luz";
    if (r.luz?.[0] === "No") f += "; al conectarlo no prende ninguna luz";
    frases.push(f + ".");
  }
  if (sintomas.length) frases.push(`${frases.length ? "Además: " : ""}${sintomas.map(min).join(", ")}.`.replace(/^./, (c) => c.toUpperCase()));
  const causas = antes.filter((a) => !a.startsWith("Nada") && !a.startsWith("Fue empeorando"));
  if (causas.length) frases.push(`Antes de la falla: ${causas.map(min).join(", ")}.`);
  if (antes.includes("Nada, fue de repente")) frases.push("Pasó de repente.");
  if (antes.includes("Fue empeorando poco a poco")) frases.push("Fue empeorando poco a poco.");
  if (r.desde?.[0]) frases.push(`Pasa desde: ${min(r.desde[0])}.`);
  if (r.datos?.[0]?.startsWith("Sí")) frases.push("Tiene archivos importantes sin copia: cuidar los datos.");

  const respondioAntes = antes.length > 0;
  const todo = [enciende, ...sintomas, ...antes].filter(Boolean) as string[];
  return {
    texto: frases.join(" "),
    // Solo calor, ruido o lentitud apunta a mantenimiento; cualquier otra señal, a reparación.
    servicio: todo.some((x) => REPARACION.includes(x)) || !todo.length ? "Reparación" : "Mantenimiento",
    liquido: antes.includes("Le cayó líquido") ? true : respondioAntes ? false : null,
    abierto: antes.includes("Lo abrió otro técnico") ? true : respondioAntes ? false : null,
  };
}
