import { waLink } from "@/lib/site";

/** Lo que el cliente llena en /recepcion/. Los nombres coinciden con CAMPOS en public/api/recepcion.php. */
export type Registro = {
  nombre: string; dni: string; whatsapp: string; correo: string; distrito: string; como: string;
  tipo: string; marca: string; modelo: string; serie: string; pin: string; accesorios: string;
  servicio: string; falla: string; liquido: boolean | null; abierto: boolean | null; acepta: boolean;
  /** Campo trampa: oculto para personas, los robots lo llenan. */
  web: string;
};

export type Orden = Omit<Registro, "acepta" | "web" | "liquido" | "abierto"> & {
  id: number; numero: string; creado: string; origen: "cliente" | "taller";
  liquido: 0 | 1 | null; abierto: 0 | 1 | null;
  estado: string; recibido: string | null; recibido_por: string | null;
};
export type Rol = "admin" | "mostrador";

export const OPCIONES = {
  tipo: ["Laptop", "PC", "Tarjeta gráfica", "Consola", "Otro"],
  como: ["Google", "TikTok", "IA (ChatGPT, Gemini, Claude…)", "Recomendación", "Ya soy cliente", "Otro"],
  servicio: ["Mantenimiento", "Reparación"],
  accesorios: ["Cargador", "Funda o mochila", "Mouse", "Control", "Cables"],
};

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

/** Mensaje que el cliente te manda al terminar: así tienes su contacto en WhatsApp sí o sí. */
export const avisoCliente = (numero: string, r: Pick<Registro, "nombre" | "tipo" | "marca" | "modelo" | "falla">) =>
  waLink(`Hola QuickFix, soy ${r.nombre}. Registré mi ${r.tipo.toLowerCase()} ${equipo(r)} con el N° ${numero}.\nFalla: ${r.falla}`);

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

/** Convierte las respuestas en un resumen breve y deduce servicio, líquido/golpe y si otro técnico lo abrió. */
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
    liquido: antes.some((a) => a === "Le cayó líquido" || a === "Se golpeó o se cayó") ? true : respondioAntes ? false : null,
    abierto: antes.includes("Lo abrió otro técnico") ? true : respondioAntes ? false : null,
  };
}
