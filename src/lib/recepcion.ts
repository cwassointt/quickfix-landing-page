import { waLink } from "@/lib/site";

/** Lo que el cliente llena en /recepcion/. Los nombres coinciden con CAMPOS en public/api/recepcion.php. */
export type Registro = {
  nombre: string; dni: string; whatsapp: string; correo: string; distrito: string; como: string;
  tipo: string; marca: string; modelo: string; serie: string; color: string; pin: string; accesorios: string;
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
  como: ["Google", "TikTok", "Instagram / Facebook", "Recomendación", "Ya soy cliente", "Otro"],
  servicio: ["Mantenimiento", "Diagnóstico electrónico", "Reparación", "No sé"],
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
