import { diagnosis, maintenance, warranty } from "@/data/catalog";

/** Página de un servicio: su URL, lo que ve Google (title/description) y lo que ve el cliente. */
export type ServicePage = {
  slug: string;
  /** Equipo que el cotizador abre ya elegido ("reparacion" abre la pestaña de diagnóstico). */
  quote: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  points: { title: string; text: string }[];
  /** Preguntas de src/data/faq.ts que aplican (por texto de la pregunta). */
  faq: string[];
  priceFrom: number;
  image: "laptop" | "laptopGamer" | "pc" | "gpu" | "macbook" | "console" | "board";
};

const from = (categoryId: string) => Math.min(...maintenance.find((c) => c.id === categoryId)!.services.map((s) => s.price));
const laptops = maintenance.find((c) => c.id === "laptops")!.services;
const price = (id: string) => laptops.find((s) => s.id === id)!.price;
const rog = laptops.find((s) => s.id === "asus-rog")!;
/** Precio de referencia del paquete ROG (lo que cuesta por separado en el mercado), mostrado tachado. */
export const rogSeparate = rog.regularPrice!;
export const rogSaving = rogSeparate - rog.price;

export const servicePages: ServicePage[] = [
  {
    slug: "mantenimiento-asus-rog",
    quote: "laptops",
    title: "Mantenimiento ASUS ROG en Lima con metal líquido | QuickFix",
    description: `Mantenimiento de ASUS ROG Strix, Zephyrus y SCAR con metal líquido y masilla térmica en San Miguel, Lima. Paquete completo a S/ ${rog.price}. Atención 24/7 con cita.`,
    h1: "Mantenimiento ASUS ROG en Lima",
    lead: `Strix, Zephyrus, SCAR y TUF. Limpieza profunda, masilla térmica y metal líquido en un solo paquete de S/ ${rog.price}: ahorras S/ ${rogSaving} frente a hacerlo por partes.`,
    points: [
      { title: "Metal líquido como de fábrica", text: "Muchas ROG salen con metal líquido en el CPU. Lo retiro sin derrames, aíslo los componentes cercanos y lo reaplico con Thermalright Silver King o Thermal Grizzly." },
      { title: "Masilla térmica en VRAM y VRM", text: "Reemplazo los pads secos por masilla UTP-8 (14.8 W/mK), que rellena mejor los espacios irregulares de las placas ROG." },
      { title: `Materiales por ${warranty.rogMaterialsYears} años`, text: `El metal líquido y la masilla del paquete duran ${warranty.rogMaterialsYears} años, con ${warranty.thermalMonths} meses de garantía térmica. Te mando fotos y videos de cada paso por WhatsApp.` },
    ],
    faq: ["¿Qué gano con metal líquido o masilla térmica?", "¿Qué garantía tiene el mantenimiento?", "¿Cada cuánto debo hacer mantenimiento?"],
    priceFrom: rog.price,
    image: "laptopGamer",
  },
  {
    slug: "mantenimiento-laptop-gamer",
    quote: "laptops",
    title: "Mantenimiento de laptop gamer en Lima | Legion, Omen, MSI | QuickFix",
    description: `Mantenimiento de laptops gamer Lenovo Legion, HP Omen y Victus, MSI, Acer Nitro y Predator en San Miguel, Lima. Desde S/ ${price("laptop-gamer")}, con masilla térmica opcional. 24/7 con cita.`,
    h1: "Mantenimiento de laptop gamer en Lima",
    lead: `Legion, LOQ, Omen, Victus, MSI, Nitro, Predator, Alienware y más. Desde S/ ${price("laptop-gamer")}; gama alta (RTX 3070, 4070, 5070 o superior) desde S/ ${price("laptop-gamer-pro")}.`,
    points: [
      { title: "Busca tu modelo y sabe el precio", text: "En el cotizador escribes el modelo de tu laptop y te digo en qué gama entra y cuánto cuesta, sin sorpresas." },
      { title: "Pasta TF8, masilla o metal líquido", text: "Pasta Thermalright TF8 (13.8 W/mK) incluida. Masilla térmica y metal líquido como extras según tu equipo." },
      { title: "Menos temperatura, más FPS", text: "Un buen mantenimiento baja de 5 °C a 15 °C y evita que la laptop baje su rendimiento por calor." },
    ],
    faq: ["¿Qué gano con metal líquido o masilla térmica?", "¿Cada cuánto debo hacer mantenimiento?", "¿Van a domicilio?"],
    priceFrom: price("laptop-gamer"),
    image: "laptopGamer",
  },
  {
    slug: "mantenimiento-pc-gamer",
    quote: "pcs",
    title: "Mantenimiento de PC gamer en Lima | QuickFix San Miguel",
    description: `Mantenimiento de PC gamer y de oficina en San Miguel, Lima: lavado químico, pasta TF8 y gestión de cables. Desde S/ ${from("pcs")}. Tarjeta gráfica con 20% de descuento en combo.`,
    h1: "Mantenimiento de PC gamer en Lima",
    lead: `Desarmo todos los componentes, los lavo y descontamino, cambio la pasta y ordeno los cables. Desde S/ ${from("pcs")}, y si traes la tarjeta gráfica, te sale 20% más barata.`,
    points: [
      { title: "Combo PC + tarjeta gráfica", text: "Con tu PC gamer, la limpieza de la GPU tiene 20% de descuento (excepto gama alta RTX 3070 / 4070 / 5070 o superior)." },
      { title: "Pads térmicos en VRM", text: "Opcional: cambio de pads de la placa madre para que las fases de poder no se sobrecalienten." },
      { title: "Gestión de cables y ventiladores", text: "Mejor flujo de aire, ventiladores lubricados y acabado con encerado mate." },
    ],
    faq: ["¿Cada cuánto debo hacer mantenimiento?", "¿Qué gano con metal líquido o masilla térmica?", "¿Cómo puedo pagar?"],
    priceFrom: from("pcs"),
    image: "pc",
  },
  {
    slug: "mantenimiento-tarjeta-grafica",
    quote: "gpus",
    title: "Mantenimiento de tarjeta gráfica (GPU) en Lima | QuickFix",
    description: `Mantenimiento de tarjetas gráficas NVIDIA RTX y AMD en San Miguel, Lima: pasta TF8, ventiladores lubricados y lavado químico. Desde S/ ${from("gpus")}.`,
    h1: "Mantenimiento de tarjeta gráfica en Lima",
    lead: `Desde S/ ${from("gpus")} según ventiladores y gama. Si la traes junto con tu PC gamer, tiene 20% de descuento.`,
    points: [
      { title: "Precio por ventiladores y gama", text: "1 o 2 ventiladores, 3 ventiladores, o gama alta (RTX 3070 / 4070 / 5070 o superior)." },
      { title: "Lubricado de ventiladores", text: "Silencia los ruidos y recupera las RPM originales." },
      { title: "¿Tu GPU falla o da artefactos?", text: `Eso ya es reparación de placa: empieza con un diagnóstico electrónico de S/ ${diagnosis.find((d) => d.id === "diag-electronico")!.price}.` },
    ],
    faq: ["¿Qué gano con metal líquido o masilla térmica?", "¿Cuánto tarda una reparación de placa?", "¿Cómo puedo pagar?"],
    priceFrom: from("gpus"),
    image: "gpu",
  },
  {
    slug: "mantenimiento-macbook",
    quote: "macbook",
    title: "Mantenimiento de MacBook Pro y Air en Lima | QuickFix",
    description: `Mantenimiento de MacBook Pro y MacBook Air en San Miguel, Lima: limpieza profunda, pasta térmica nueva y limpieza de teclado. Desde S/ ${from("macbook")}.`,
    h1: "Mantenimiento de MacBook en Lima",
    lead: `MacBook Air y demás modelos desde S/ ${from("macbook")}; todos los MacBook Pro a S/ ${maintenance.find((c) => c.id === "macbook")!.services.find((s) => s.id === "macbook-pro")!.price}.`,
    points: [
      { title: "Desarmado con herramienta adecuada", text: "Tornillería pentalobe y cuidado con los conectores flex." },
      { title: "Pasta térmica nueva", text: "Para que el MacBook deje de calentarse y de sonar el ventilador sin motivo." },
      { title: "Teclado y pantalla", text: "Limpieza de teclado, trackpad y pantalla incluida." },
    ],
    faq: ["¿Pierdo mis archivos con el mantenimiento?", "¿Cada cuánto debo hacer mantenimiento?", "¿Van a domicilio?"],
    priceFrom: from("macbook"),
    image: "macbook",
  },
  {
    slug: "mantenimiento-ps5-ps4",
    quote: "consolas",
    title: "Mantenimiento de PS5 y PS4 en Lima con metal líquido | QuickFix",
    description: `Mantenimiento de PlayStation 5 y PlayStation 4 en San Miguel, Lima: limpieza profunda, pads térmicos y metal líquido para PS5. Desde S/ ${from("consolas")}.`,
    h1: "Mantenimiento de PS5 y PS4 en Lima",
    lead: `PS4 desde S/ ${from("consolas")} y PS5 desde S/ ${maintenance.find((c) => c.id === "consolas")!.services.find((s) => s.id === "ps5")!.price}. Si tu consola suena fuerte o se apaga jugando, es calor.`,
    points: [
      { title: "Metal líquido en PS5", text: "La PS5 trae metal líquido de fábrica; lo renuevo sin derrames." },
      { title: "Pads térmicos nuevos", text: "Cambio de pads para memorias y fases de poder." },
      { title: "Menos ruido", text: "Limpieza del ventilador y los disipadores para que vuelva a ser silenciosa." },
    ],
    faq: ["¿Cada cuánto debo hacer mantenimiento?", "¿Cómo puedo pagar?", "¿Por qué atienden solo con cita?"],
    priceFrom: from("consolas"),
    image: "console",
  },
  {
    slug: "reparacion-placa-laptop",
    quote: "reparacion",
    title: "Reparación de placa de laptop y GPU en Lima | Microsoldadura | QuickFix",
    description: `Reparación de placa madre de laptops y tarjetas gráficas en San Miguel, Lima: equipos que no encienden, cortos y daños por líquido. Diagnóstico electrónico de S/ ${diagnosis.find((d) => d.id === "diag-electronico")!.price}, descontable si reparas.`,
    h1: "Reparación de placa de laptop y GPU en Lima",
    lead: `Microsoldadura para equipos que no encienden, se apagan o recibieron líquido. Diagnóstico electrónico de S/ ${diagnosis.find((d) => d.id === "diag-electronico")!.price} en 1 a 2 días, que se descuenta si reparas conmigo.`,
    points: [
      { title: "Laptops gamer y de oficina", text: "Circuito de carga y encendido, chip KBC, salida de video, puertos USB-C y de carga." },
      { title: "Tarjetas gráficas", text: "Reballing, cambio de memorias VRAM, cortos en MOSFET y VRM, BIOS y puertos de video." },
      { title: "Daños por líquido", text: "Lavado químico para detener la corrosión antes de evaluar qué se puede salvar." },
    ],
    faq: ["Derramé líquido en mi laptop, ¿qué hago?", "¿Cuánto tarda una reparación de placa?"],
    priceFrom: diagnosis.find((d) => d.id === "diag-general")!.price,
    image: "board",
  },
];
